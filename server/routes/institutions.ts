import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all institutions with search and filtering
router.get('/', async (req, res) => {
  try {
    const { search, state, district, type } = req.query;

    const whereClause: any = {};

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { name: { contains: search } },
        { aicteId: { contains: search } },
        { district: { contains: search } },
      ];
    }

    if (state && typeof state === 'string' && state !== 'All') {
      whereClause.state = state;
    }

    if (district && typeof district === 'string' && district !== 'All') {
      whereClause.district = district;
    }

    if (type && typeof type === 'string' && type !== 'All') {
      whereClause.type = type;
    }

    const institutions = await prisma.institution.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { complaints: true, overlaps: true },
        },
      },
      orderBy: { totalComplaints: 'desc' },
    });

    res.json(institutions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Institution 360° Profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const institution = await prisma.institution.findFirst({
      where: {
        OR: [{ id }, { aicteId: id }],
      },
      include: {
        complaints: {
          include: {
            bureau: true,
            assignedOfficer: {
              select: { id: true, name: true, email: true },
            },
            actions: {
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
          orderBy: { dateReceived: 'desc' },
        },
        overlaps: {
          include: {
            originalComplaint: { include: { bureau: true } },
            relatedComplaint: { include: { bureau: true } },
          },
        },
      },
    });

    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    // Calculate bureau-wise breakdown for this institution
    const bureauCounts: Record<string, { code: string; name: string; count: number; pending: number; resolved: number }> = {};

    for (const c of institution.complaints) {
      const code = c.bureau.code;
      if (!bureauCounts[code]) {
        bureauCounts[code] = {
          code,
          name: c.bureau.name,
          count: 0,
          pending: 0,
          resolved: 0,
        };
      }
      bureauCounts[code].count++;
      if (c.status === 'RESOLVED') {
        bureauCounts[code].resolved++;
      } else {
        bureauCounts[code].pending++;
      }
    }

    // Aggregate unified timeline of actions across all complaints of this institution
    const complaintIds = institution.complaints.map((c) => c.id);
    const actionsTimeline = await prisma.complaintAction.findMany({
      where: { complaintId: { in: complaintIds } },
      include: {
        complaint: {
          select: { complaintNo: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({
      institution,
      bureauBreakdown: Object.values(bureauCounts),
      actionsTimeline,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Add New Institution
router.post('/', authenticateJWT, requireRole(['SUPER_ADMIN', 'SENIOR_OFFICIAL']), async (req: AuthRequest, res) => {
  try {
    const { aicteId, name, type, state, district, address, pinCode, contactPerson, email, phone, website, approvalYear } = req.body;

    if (!aicteId || !name || !type || !state || !district) {
      return res.status(400).json({ error: 'AICTE ID, Name, Type, State, and District are required' });
    }

    const existing = await prisma.institution.findUnique({
      where: { aicteId },
    });

    if (existing) {
      return res.status(409).json({ error: 'Institution with this AICTE ID already exists' });
    }

    const created = await prisma.institution.create({
      data: {
        aicteId,
        name,
        type,
        state,
        district,
        address: address || '',
        pinCode: pinCode || '',
        contactPerson,
        email,
        phone,
        website,
        approvalYear: approvalYear ? parseInt(approvalYear) : 2020,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name || 'Authorized Official',
        userRole: req.user?.role || 'SUPER_ADMIN',
        action: 'INSTITUTION_REGISTERED',
        entityType: 'Institution',
        entityId: created.id,
        details: `Registered new institution "${created.name}" (AICTE ID: ${created.aicteId})`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

