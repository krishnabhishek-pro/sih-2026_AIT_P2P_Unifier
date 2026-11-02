import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'aicte_augms_super_secure_secret_jwt_key_2026_sih';

// GET Demo users for quick testing and demonstration
router.get('/demo-users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        bureau: true,
      },
      orderBy: { role: 'asc' },
    });

    const sanitized = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      designation: u.designation,
      bureau: u.bureau ? { id: u.bureau.id, name: u.bureau.name, code: u.bureau.code } : null,
      region: u.region,
      avatar: u.avatar,
    }));

    res.json(sanitized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { bureau: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid AICTE credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid AICTE credentials' });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      bureauId: user.bureauId,
      region: user.region,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Log login in audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'LOGIN',
        entityType: 'Auth',
        entityId: user.id,
        details: `Successful authenticated login session established for role ${user.role}.`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        bureau: user.bureau,
        region: user.region,
        avatar: user.avatar,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Current User Profile
router.get('/me', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { bureau: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      bureau: user.bureau,
      region: user.region,
      avatar: user.avatar,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

