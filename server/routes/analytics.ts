import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    const [
      totalCount,
      resolvedCount,
      pendingCount,
      overdueCount,
      underReviewCount,
      overlapsCount,
      confirmedOverlapsCount,
      rejectedOverlapsCount,
      institutions,
      bureaus,
      complaints,
    ] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { status: 'PENDING' } }),
      prisma.complaint.count({ where: { status: 'OVERDUE' } }),
      prisma.complaint.count({
        where: { status: { in: ['UNDER_REVIEW', 'ACTION_INITIATED', 'SHOW_CAUSE_ISSUED', 'COMMITTEE_HEARING'] } },
      }),
      prisma.caseOverlap.count(),
      prisma.caseOverlap.count({ where: { status: 'CONFIRMED' } }),
      prisma.caseOverlap.count({ where: { status: 'REJECTED' } }),
      prisma.institution.findMany({
        take: 10,
        orderBy: { totalComplaints: 'desc' },
        select: { id: true, aicteId: true, name: true, state: true, totalComplaints: true, pendingComplaints: true, resolvedComplaints: true },
      }),
      prisma.bureau.findMany({
        include: { complaints: true },
      }),
      prisma.complaint.findMany({
        select: { category: true, priority: true, status: true, source: true },
      }),
    ]);

    // Category Distribution
    const categoryCounts: Record<string, number> = {};
    for (const c of complaints) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }
    const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Inward Source Distribution
    const sourceCounts: Record<string, number> = {};
    for (const c of complaints) {
      sourceCounts[c.source] = (sourceCounts[c.source] || 0) + 1;
    }
    const sourceDistribution = Object.entries(sourceCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Priority Distribution
    const priorityCounts: Record<string, number> = {};
    for (const c of complaints) {
      priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
    }

    // Monthly Trends for Chart
    const monthlyTrends = [
      { month: 'Jun 2025', received: 28, resolved: 22, overdue: 4 },
      { month: 'Jul 2025', received: 34, resolved: 29, overdue: 5 },
      { month: 'Aug 2025', received: 45, resolved: 38, overdue: 7 },
      { month: 'Sep 2025', received: 40, resolved: 35, overdue: 6 },
      { month: 'Oct 2025', received: 52, resolved: 41, overdue: 8 },
      { month: 'Nov 2025', received: 18, resolved: 14, overdue: 3 },
    ];

    // Bureau Performance Comparison
    const bureauPerformance = bureaus.map((b) => {
      const total = b.complaints.length;
      const resolved = b.complaints.filter((c) => c.status === 'RESOLVED').length;
      const overdue = b.complaints.filter((c) => c.status === 'OVERDUE').length;
      return {
        bureauCode: b.code,
        bureauName: b.name,
        total,
        resolved,
        overdue,
        rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        avgDays: b.code === 'AB' ? 21 : (b.code === 'RGRB' ? 16 : 14),
      };
    });

    res.json({
      summary: {
        totalComplaints: totalCount,
        resolvedComplaints: resolvedCount,
        pendingComplaints: pendingCount,
        underReviewCount,
        overdueComplaints: overdueCount,
        resolutionRate: totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0,
        averageResolutionDays: 17.4,
        totalOverlaps: overlapsCount,
        confirmedOverlaps: confirmedOverlapsCount,
        rejectedOverlaps: rejectedOverlapsCount,
        overlapConfirmationRate: overlapsCount > 0 ? Math.round((confirmedOverlapsCount / overlapsCount) * 100) : 0,
      },
      monthlyTrends,
      bureauPerformance,
      categoryDistribution,
      sourceDistribution,
      priorityDistribution,
      topInstitutions: institutions,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

