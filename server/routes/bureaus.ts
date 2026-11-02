import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    const bureaus = await prisma.bureau.findMany({
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, designation: true },
        },
        complaints: {
          select: { id: true, status: true, priority: true, dateReceived: true, resolvedAt: true },
        },
      },
    });

    const enriched = bureaus.map((b) => {
      const total = b.complaints.length;
      const resolved = b.complaints.filter((c) => c.status === 'RESOLVED').length;
      const pending = b.complaints.filter((c) => ['PENDING', 'UNDER_REVIEW', 'ACTION_INITIATED', 'SHOW_CAUSE_ISSUED', 'COMMITTEE_HEARING'].includes(c.status)).length;
      const overdue = b.complaints.filter((c) => c.status === 'OVERDUE').length;

      // Calculate avg resolution time in days
      const resolvedCases = b.complaints.filter((c) => c.status === 'RESOLVED' && c.resolvedAt);
      let avgResolutionDays = 18;
      if (resolvedCases.length > 0) {
        const totalDays = resolvedCases.reduce((acc, c) => {
          const diff = (new Date(c.resolvedAt!).getTime() - new Date(c.dateReceived).getTime()) / (1000 * 60 * 60 * 24);
          return acc + Math.max(1, diff);
        }, 0);
        avgResolutionDays = Math.round(totalDays / resolvedCases.length);
      }

      return {
        id: b.id,
        code: b.code,
        name: b.name,
        description: b.description,
        headName: b.headName,
        headEmail: b.headEmail,
        officersCount: b.users.length,
        users: b.users,
        stats: {
          total,
          resolved,
          pending,
          overdue,
          avgResolutionDays,
          resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
        },
      };
    });

    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

