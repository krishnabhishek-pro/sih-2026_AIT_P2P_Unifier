import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest, optionalAuth, requireRole } from '../middleware/auth';
import { runFullOverlapScan } from '../services/overlapEngine';

const router = Router();
const prisma = new PrismaClient();

// GET all overlaps with filters
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { status, minScore } = req.query;

    const whereClause: any = {};

    if (status && typeof status === 'string' && status !== 'All') {
      whereClause.status = status;
    }

    if (minScore && typeof minScore === 'string') {
      whereClause.matchScore = { gte: parseInt(minScore) };
    }

    const overlaps = await prisma.caseOverlap.findMany({
      where: whereClause,
      include: {
        institution: {
          select: { id: true, aicteId: true, name: true, state: true, district: true },
        },
        originalComplaint: {
          include: {
            bureau: true,
            assignedOfficer: { select: { id: true, name: true } },
          },
        },
        relatedComplaint: {
          include: {
            bureau: true,
            assignedOfficer: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // POTENTIAL first
        { matchScore: 'desc' },
      ],
    });

    const parsed = overlaps.map((ov) => ({
      ...ov,
      reasons: JSON.parse(ov.reasons || '[]'),
    }));

    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Single Overlap Details for Side-by-Side Comparison
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const overlap = await prisma.caseOverlap.findUnique({
      where: { id },
      include: {
        institution: true,
        originalComplaint: {
          include: {
            bureau: true,
            assignedOfficer: true,
            documents: true,
            actions: { take: 5, orderBy: { createdAt: 'desc' } },
          },
        },
        relatedComplaint: {
          include: {
            bureau: true,
            assignedOfficer: true,
            documents: true,
            actions: { take: 5, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });

    if (!overlap) {
      return res.status(404).json({ error: 'Overlap record not found' });
    }

    res.json({
      ...overlap,
      reasons: JSON.parse(overlap.reasons || '[]'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Review Action on Overlap: CONFIRMED | REJECTED | UNDER_REVIEW
router.post('/:id/review', authenticateJWT, requireRole(['SUPER_ADMIN', 'SENIOR_OFFICIAL', 'BUREAU_HEAD']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;

    if (!['CONFIRMED', 'REJECTED', 'UNDER_REVIEW'].includes(action)) {
      return res.status(400).json({
        error: 'Invalid action. Must be one of: CONFIRMED (Confirm Related Cases), REJECTED (Reject Match), UNDER_REVIEW (Mark for Further Review)',
      });
    }

    if (!remarks || remarks.trim().length < 5) {
      return res.status(400).json({ error: 'A clear official review rationale / remarks (minimum 5 chars) is mandatory.' });
    }

    const overlap = await prisma.caseOverlap.findUnique({
      where: { id },
      include: {
        originalComplaint: true,
        relatedComplaint: true,
        institution: true,
      },
    });

    if (!overlap) {
      return res.status(404).json({ error: 'Overlap record not found' });
    }

    // Update Overlap record
    const updated = await prisma.caseOverlap.update({
      where: { id },
      data: {
        status: action,
        reviewedById: req.user?.id,
        reviewedByName: req.user?.name || 'Authorized Official',
        reviewedAt: new Date(),
        reviewDecisionRemarks: remarks,
      },
    });

    // RULE: If Confirmed Related Cases:
    // Mark both complaints with crossBureauLinked = true
    // (Never automatically merge or close complaints!)
    if (action === 'CONFIRMED') {
      await prisma.complaint.update({
        where: { id: overlap.originalComplaintId },
        data: { crossBureauLinked: true },
      });
      await prisma.complaint.update({
        where: { id: overlap.relatedComplaintId },
        data: { crossBureauLinked: true },
      });

      // Add actions to both complaints' timelines
      await prisma.complaintAction.create({
        data: {
          complaintId: overlap.originalComplaintId,
          performedById: req.user?.id,
          performerName: req.user?.name || 'Authorized Official',
          performerRole: req.user?.role || 'SENIOR_OFFICIAL',
          actionType: 'OVERLAP_LINKED',
          remarks: `Cross-Bureau Overlap CONFIRMED with complaint ${overlap.relatedComplaint.complaintNo}. Joint inquiry coordinated. Decision Notes: ${remarks}`,
        },
      });

      await prisma.complaintAction.create({
        data: {
          complaintId: overlap.relatedComplaintId,
          performedById: req.user?.id,
          performerName: req.user?.name || 'Authorized Official',
          performerRole: req.user?.role || 'SENIOR_OFFICIAL',
          actionType: 'OVERLAP_LINKED',
          remarks: `Cross-Bureau Overlap CONFIRMED with complaint ${overlap.originalComplaint.complaintNo}. Joint inquiry coordinated. Decision Notes: ${remarks}`,
        },
      });
    }

    // Record in Audit Trail
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name || 'Authorized Official',
        userRole: req.user?.role || 'SENIOR_OFFICIAL',
        action: `OVERLAP_${action}`,
        entityType: 'Overlap',
        entityId: overlap.id,
        details: `Official review decision: ${action} for overlap between ${overlap.originalComplaint.complaintNo} and ${overlap.relatedComplaint.complaintNo} at ${overlap.institution.name}. Reason: ${remarks}`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.json({
      success: true,
      overlap: updated,
      message: `Overlap decision successfully registered as ${action}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Trigger Full Automated Overlap Scan across all active cases
router.post('/scan', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const result = await runFullOverlapScan();

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name || 'System Official',
        userRole: req.user?.role || 'SUPER_ADMIN',
        action: 'OVERLAP_SCAN_TRIGGERED',
        entityType: 'OverlapEngine',
        entityId: 'SYSTEM',
        details: `Automated cross-bureau overlap detection scan executed. Detected ${result.detectedCount} potential correlations.`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.json({
      success: true,
      result,
      message: `Overlap scan finished. Scanned all active records and indexed ${result.newOverlapsCount} new cross-bureau correlation(s).`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

