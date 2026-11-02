import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, optionalAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET Audit Logs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { action, entityType, limit = '50' } = req.query;

    const whereClause: any = {};
    if (action && typeof action === 'string' && action !== 'All') {
      whereClause.action = action;
    }
    if (entityType && typeof entityType === 'string' && entityType !== 'All') {
      whereClause.entityType = entityType;
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string) || 50,
    });

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

