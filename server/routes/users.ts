import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all users
router.get('/', authenticateJWT, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { bureau: true },
      orderBy: { createdAt: 'desc' },
    });

    const sanitized = users.map((u) => ({
      id: u.id,
      employeeId: u.employeeId,
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.designation,
      bureau: u.bureau,
      region: u.region,
      phone: u.phone,
      avatar: u.avatar,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    res.json(sanitized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Add User
router.post('/', authenticateJWT, requireRole(['SUPER_ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { employeeId, name, email, password, role, designation, bureauId, region, phone } = req.body;

    if (!name || !email || !password || !role || !designation) {
      return res.status(400).json({ error: 'Name, email, password, role, and designation are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'User with this email already registered' });
    }

    let finalEmployeeId = employeeId?.trim();
    if (!finalEmployeeId) {
      const userCount = await prisma.user.count();
      finalEmployeeId = `AICTE/EMP/2026/${(userCount + 101).toString()}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        employeeId: finalEmployeeId,
        name,
        email,
        passwordHash,
        role,
        designation,
        bureauId: bureauId || null,
        region: region || 'Central HQ (New Delhi)',
        phone,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?w=150`,
      },
      include: { bureau: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        userName: req.user?.name || 'Super Admin',
        userRole: 'SUPER_ADMIN',
        action: 'USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        details: `Created new official account for ${user.name} (${user.email}) with role ${user.role}.`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      bureau: user.bureau,
      region: user.region,
      phone: user.phone,
      avatar: user.avatar,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

