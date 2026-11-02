import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateJWT, AuthRequest, optionalAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', optionalAuth, async (_req: AuthRequest, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/read-all', authenticateJWT, async (_req, res) => {
  try {
    await prisma.notification.updateMany({
      data: { isRead: true },
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

