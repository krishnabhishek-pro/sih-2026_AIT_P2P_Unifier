import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user?.role;
    const userBureauId = req.user?.bureauId;

    // Role-based filtering if Bureau Officer / Head requests restricted view
    const complaintFilter: any = {};
    if (userRole === 'BUREAU_OFFICER' && req.user?.id) {
      complaintFilter.assignedOfficerId = req.user.id;
    } else if (userRole === 'BUREAU_HEAD' && userBureauId) {
      complaintFilter.bureauId = userBureauId;
    }

    // 1. Metric Cards
    const totalComplaints = await prisma.complaint.count({ where: complaintFilter });
    const pendingComplaints = await prisma.complaint.count({
      where: { ...complaintFilter, status: 'PENDING' },
    });
    const underReview = await prisma.complaint.count({
      where: {
        ...complaintFilter,
        status: { in: ['UNDER_REVIEW', 'ACTION_INITIATED', 'SHOW_CAUSE_ISSUED', 'COMMITTEE_HEARING'] },
      },
    });
    const resolvedComplaints = await prisma.complaint.count({
      where: { ...complaintFilter, status: 'RESOLVED' },
    });
    const overdueComplaints = await prisma.complaint.count({
      where: { ...complaintFilter, status: 'OVERDUE' },
    });

    const potentialOverlaps = await prisma.caseOverlap.count({
      where: { status: 'POTENTIAL' },
    });
    const confirmedOverlaps = await prisma.caseOverlap.count({
      where: { status: 'CONFIRMED' },
    });

    // 2. Complaint Trends (Past 6 Months Received vs Resolved)
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const trendData = [
      { month: 'Jun', received: 28, resolved: 22, overdue: 4 },
      { month: 'Jul', received: 34, resolved: 29, overdue: 5 },
      { month: 'Aug', received: 45, resolved: 38, overdue: 7 },
      { month: 'Sep', received: 40, resolved: 35, overdue: 6 },
      { month: 'Oct', received: 52, resolved: 41, overdue: 8 },
      { month: 'Nov', received: 18, resolved: 14, overdue: 3 },
    ];

    // 3. Bureau-wise Distribution
    const bureaus = await prisma.bureau.findMany({
      include: {
        complaints: true,
      },
    });

    const bureauDistribution = bureaus.map((b) => ({
      bureauCode: b.code,
      bureauName: b.name,
      total: b.complaints.length,
      pending: b.complaints.filter((c) => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length,
      resolved: b.complaints.filter((c) => c.status === 'RESOLVED').length,
      overdue: b.complaints.filter((c) => c.status === 'OVERDUE').length,
    }));

    // 4. Status Distribution for Donut Chart
    const statusDistribution = [
      { name: 'Pending Initial Scrutiny', value: pendingComplaints, color: '#f59e0b' },
      { name: 'Under Review / Inquiry', value: underReview, color: '#3b82f6' },
      { name: 'Resolved & Closed', value: resolvedComplaints, color: '#10b981' },
      { name: 'Overdue (SLA Breached)', value: overdueComplaints, color: '#ef4444' },
    ];

    // 5. Recent Complaints
    const recentComplaints = await prisma.complaint.findMany({
      where: complaintFilter,
      take: 7,
      orderBy: { dateReceived: 'desc' },
      include: {
        institution: {
          select: { name: true, aicteId: true, state: true },
        },
        bureau: {
          select: { code: true, name: true },
        },
      },
    });

    // 6. Overlap Alerts (top recent active potential matches)
    const overlapAlerts = await prisma.caseOverlap.findMany({
      where: { status: 'POTENTIAL' },
      take: 4,
      orderBy: { matchScore: 'desc' },
      include: {
        institution: true,
        originalComplaint: {
          include: { bureau: true },
        },
        relatedComplaint: {
          include: { bureau: true },
        },
      },
    });

    res.json({
      metrics: {
        totalComplaints,
        pendingComplaints,
        underReview,
        resolvedComplaints,
        overdueComplaints,
        potentialOverlaps,
        confirmedOverlaps,
      },
      trendData,
      bureauDistribution,
      statusDistribution,
      recentComplaints,
      overlapAlerts: overlapAlerts.map((ov) => ({
        id: ov.id,
        matchScore: ov.matchScore,
        status: ov.status,
        institutionName: ov.institution.name,
        institutionAicteId: ov.institution.aicteId,
        c1: {
          id: ov.originalComplaint.id,
          complaintNo: ov.originalComplaint.complaintNo,
          category: ov.originalComplaint.category,
          bureau: ov.originalComplaint.bureau.name,
          bureauCode: ov.originalComplaint.bureau.code,
        },
        c2: {
          id: ov.relatedComplaint.id,
          complaintNo: ov.relatedComplaint.complaintNo,
          category: ov.relatedComplaint.category,
          bureau: ov.relatedComplaint.bureau.name,
          bureauCode: ov.relatedComplaint.bureau.code,
        },
        reasons: JSON.parse(ov.reasons || '[]'),
        createdAt: ov.createdAt,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

