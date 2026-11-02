import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest, optionalAuth } from '../middleware/auth';
import { calculateComplaintSimilarity } from '../services/overlapEngine';

const router = Router();
const prisma = new PrismaClient();

// GET complaints with search, filters, sorting & pagination
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      search,
      bureau,
      status,
      priority,
      category,
      page = '1',
      limit = '15',
      sortBy = 'dateReceived',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 15;
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    // Role-based restrictions if officer wants only their assigned cases
    if (req.user?.role === 'BUREAU_OFFICER' && req.query.myCases === 'true') {
      whereClause.assignedOfficerId = req.user.id;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { complaintNo: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
        { institution: { name: { contains: search } } },
        { institution: { aicteId: { contains: search } } },
      ];
    }

    if (bureau && typeof bureau === 'string' && bureau !== 'All') {
      whereClause.bureau = { code: bureau };
    }

    if (status && typeof status === 'string' && status !== 'All') {
      whereClause.status = status;
    }

    if (priority && typeof priority === 'string' && priority !== 'All') {
      whereClause.priority = priority;
    }

    if (category && typeof category === 'string' && category !== 'All') {
      whereClause.category = category;
    }

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where: whereClause }),
      prisma.complaint.findMany({
        where: whereClause,
        include: {
          institution: {
            select: { id: true, aicteId: true, name: true, state: true, district: true },
          },
          bureau: {
            select: { id: true, code: true, name: true },
          },
          assignedOfficer: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { actions: true, documents: true },
          },
        },
        orderBy: {
          [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      complaints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET single complaint details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id }, { complaintNo: id }],
      },
      include: {
        institution: true,
        bureau: true,
        assignedOfficer: true,
        actions: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        originalOverlaps: {
          include: {
            relatedComplaint: {
              include: { bureau: true },
            },
          },
        },
        relatedOverlaps: {
          include: {
            originalComplaint: {
              include: { bureau: true },
            },
          },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint record not found' });
    }

    res.json(complaint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Register new complaint (Inward case)
router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const {
      institutionId,
      bureauId,
      category,
      priority = 'MEDIUM',
      title,
      description,
      complainantType = 'Faculty',
      complainantName,
      complainantEmail,
      complainantPhone,
      source = 'DIRECT_PORTAL',
      remarks,
    } = req.body;

    if (!institutionId || !bureauId || !category || !title || !description) {
      return res.status(400).json({ error: 'Missing mandatory fields: institutionId, bureauId, category, title, description' });
    }

    const count = await prisma.complaint.count();
    const nextSeq = count + 1;
    const complaintNo = `AICTE/GRV/2026/${nextSeq.toString().padStart(4, '0')}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Standard 30-day AICTE SLA

    const complaint = await prisma.complaint.create({
      data: {
        complaintNo,
        institutionId,
        bureauId,
        category,
        priority,
        status: 'PENDING',
        title,
        description,
        complainantType,
        complainantName: complainantName || 'Protected Complainant',
        complainantEmail,
        complainantPhone,
        source,
        dueDate,
        remarks,
      },
      include: {
        institution: true,
        bureau: true,
      },
    });

    // Record initial action
    await prisma.complaintAction.create({
      data: {
        complaintId: complaint.id,
        performedById: req.user?.id,
        performerName: req.user?.name || 'Authorized Official',
        performerRole: req.user?.role || 'SUPER_ADMIN',
        actionType: 'STATUS_UPDATE',
        previousStatus: 'NEW_REGISTRATION',
        newStatus: 'PENDING',
        remarks: remarks || 'Grievance registered and assigned to bureau inbox.',
      },
    });

    // Update Institution statistics
    await prisma.institution.update({
      where: { id: institutionId },
      data: {
        totalComplaints: { increment: 1 },
        pendingComplaints: { increment: 1 },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name || 'System Official',
        userRole: req.user?.role || 'SUPER_ADMIN',
        action: 'COMPLAINT_REGISTERED',
        entityType: 'Complaint',
        entityId: complaint.complaintNo,
        details: `Registered new grievance case "${complaint.complaintNo}" for ${complaint.institution.name} under ${complaint.bureau.name}.`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    // Automatic Overlap Detection check against existing complaints of same institution!
    const otherComplaints = await prisma.complaint.findMany({
      where: {
        institutionId: complaint.institutionId,
        id: { not: complaint.id },
      },
      include: { bureau: true, institution: true },
    });

    let detectedMatch = null;
    for (const other of otherComplaints) {
      const match = calculateComplaintSimilarity(complaint, other);
      if (match) {
        detectedMatch = match;
        await prisma.caseOverlap.create({
          data: {
            originalComplaintId: other.id,
            relatedComplaintId: complaint.id,
            institutionId: complaint.institutionId,
            originalBureauId: other.bureauId,
            relatedBureauId: complaint.bureauId,
            matchScore: match.matchScore,
            reasons: JSON.stringify(match.reasons),
            status: 'POTENTIAL',
          },
        });

        await prisma.notification.create({
          data: {
            title: `Cross-Bureau Overlap Alert (${match.matchScore}%)`,
            message: `New case ${complaint.complaintNo} overlaps with ${other.complaintNo} at ${complaint.institution.name}.`,
            type: 'OVERLAP_ALERT',
            linkUrl: '/overlaps',
          },
        });
        break;
      }
    }

    res.status(201).json({
      complaint,
      overlapDetected: !!detectedMatch,
      matchScore: detectedMatch?.matchScore || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update status
router.patch('/:id/status', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { institution: true, bureau: true },
    });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const previousStatus = complaint.status;
    const isResolved = status === 'RESOLVED' || status === 'CLOSED';

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        resolvedAt: isResolved ? new Date() : null,
      },
    });

    // Log action in complaint timeline
    await prisma.complaintAction.create({
      data: {
        complaintId: id,
        performedById: req.user?.id,
        performerName: req.user?.name || 'Desk Officer',
        performerRole: req.user?.role || 'BUREAU_OFFICER',
        actionType: 'STATUS_UPDATE',
        previousStatus,
        newStatus: status,
        remarks: remarks || `Status transitioned from ${previousStatus} to ${status}.`,
      },
    });

    // Update institution counters if status changed to/from resolved
    if (isResolved && previousStatus !== 'RESOLVED') {
      await prisma.institution.update({
        where: { id: complaint.institutionId },
        data: {
          pendingComplaints: { decrement: 1 },
          resolvedComplaints: { increment: 1 },
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name || 'Officer',
        userRole: req.user?.role || 'BUREAU_OFFICER',
        action: 'COMPLAINT_STATUS_UPDATED',
        entityType: 'Complaint',
        entityId: complaint.complaintNo,
        details: `Updated status for ${complaint.complaintNo} to ${status}. Remarks: ${remarks || 'None'}`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Assign / Reassign officer
router.post('/:id/assign', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { officerId, notes } = req.body;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const officer = await prisma.user.findUnique({ where: { id: officerId } });
    if (!officer) return res.status(404).json({ error: 'Officer not found' });

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        assignedOfficerId: officer.id,
        status: complaint.status === 'PENDING' ? 'UNDER_REVIEW' : complaint.status,
      },
      include: { assignedOfficer: true },
    });

    // Record action
    await prisma.complaintAction.create({
      data: {
        complaintId: id,
        performedById: req.user?.id,
        performerName: req.user?.name || 'Bureau Head',
        performerRole: req.user?.role || 'BUREAU_HEAD',
        actionType: 'ASSIGNED',
        remarks: `Assigned case to ${officer.name} (${officer.designation}). Notes: ${notes || 'Immediate examination required.'}`,
      },
    });

    // Notification to assigned officer
    await prisma.notification.create({
      data: {
        userId: officer.id,
        title: 'New Grievance Assigned',
        message: `You have been designated investigating officer for ${complaint.complaintNo}.`,
        type: 'COMPLAINT_ASSIGNED',
        linkUrl: `/complaints/${complaint.id}`,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name || 'Bureau Head',
        userRole: req.user?.role || 'BUREAU_HEAD',
        action: 'OFFICER_REASSIGNED',
        entityType: 'Complaint',
        entityId: complaint.complaintNo,
        details: `Assigned ${complaint.complaintNo} to ${officer.name}.`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Transfer Bureau
router.post('/:id/transfer', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { targetBureauId, transferReason } = req.body;

    if (!targetBureauId || !transferReason) {
      return res.status(400).json({ error: 'Target bureau ID and transfer reason are mandatory.' });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { bureau: true },
    });

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const targetBureau = await prisma.bureau.findUnique({ where: { id: targetBureauId } });
    if (!targetBureau) return res.status(404).json({ error: 'Target bureau not found' });

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        bureauId: targetBureau.id,
        assignedOfficerId: null, // Reset assigned officer for new bureau head to delegate
        remarks: `Transferred from ${complaint.bureau.name} to ${targetBureau.name}. Reason: ${transferReason}`,
      },
      include: { bureau: true },
    });

    // Timeline action
    await prisma.complaintAction.create({
      data: {
        complaintId: id,
        performedById: req.user?.id,
        performerName: req.user?.name || 'Authorized Official',
        performerRole: req.user?.role || 'BUREAU_HEAD',
        actionType: 'TRANSFERRED',
        remarks: `Case transferred from ${complaint.bureau.name} to ${targetBureau.name}. Transfer Remarks: ${transferReason}`,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name || 'Bureau Head',
        userRole: req.user?.role || 'BUREAU_HEAD',
        action: 'BUREAU_TRANSFERRED',
        entityType: 'Complaint',
        entityId: complaint.complaintNo,
        details: `Transferred case ${complaint.complaintNo} from ${complaint.bureau.name} to ${targetBureau.name}. Reason: ${transferReason}`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Add Remarks
router.post('/:id/remarks', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks) {
      return res.status(400).json({ error: 'Remarks content cannot be empty' });
    }

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const action = await prisma.complaintAction.create({
      data: {
        complaintId: id,
        performedById: req.user?.id,
        performerName: req.user?.name || 'Monitoring Official',
        performerRole: req.user?.role || 'BUREAU_OFFICER',
        actionType: 'REMARK_ADDED',
        remarks,
      },
    });

    res.status(201).json(action);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Document Upload
router.post('/:id/documents', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, fileName, fileUrl, fileType, fileSize } = req.body;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const doc = await prisma.complaintDocument.create({
      data: {
        complaintId: id,
        title: title || fileName || 'Official Document Annexure',
        fileName: fileName || 'Document.pdf',
        fileUrl: fileUrl || '/uploads/sample_annexure.pdf',
        fileType: fileType || 'application/pdf',
        fileSize: fileSize || '1.8 MB',
        uploadedBy: req.user?.name || 'Desk Officer',
      },
    });

    await prisma.complaintAction.create({
      data: {
        complaintId: id,
        performedById: req.user?.id,
        performerName: req.user?.name || 'Desk Officer',
        performerRole: req.user?.role || 'BUREAU_OFFICER',
        actionType: 'DOCUMENT_UPLOADED',
        remarks: `Uploaded official document annexure: "${doc.title}" (${doc.fileName})`,
      },
    });

    res.status(201).json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

