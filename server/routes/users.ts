import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticateJWT, optionalAuth, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all users
router.get('/', optionalAuth, async (_req, res) => {
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

// GET /profile - Get current user profile
router.get('/profile', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = (req.query.userId as string) || req.user?.id;
    const userEmail = (req.query.email as string) || req.user?.email;

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: { bureau: true },
      });
    } else if (userEmail) {
      user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { bureau: true },
      });
    } else {
      user = await prisma.user.findFirst({
        include: { bureau: true },
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      bureau: user.bureau,
      bureauId: user.bureauId,
      region: user.region,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /profile - Update profile details and avatar
router.put('/profile', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      designation,
      region,
      avatar,
      currentPassword,
      newPassword,
    } = req.body;

    const targetUserId = userId || req.user?.id;
    const targetEmail = email || req.user?.email;

    let user = null;
    if (targetUserId) {
      user = await prisma.user.findUnique({ where: { id: targetUserId } });
    } else if (targetEmail) {
      user = await prisma.user.findUnique({ where: { email: targetEmail } });
    } else {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Check email uniqueness if email is modified
    if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (emailExists && emailExists.id !== user.id) {
        return res.status(409).json({ error: 'Another official account is already registered with this email address' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (designation !== undefined) updateData.designation = designation.trim();
    if (region !== undefined) updateData.region = region.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    // Password change verification
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password entered is incorrect' });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      include: { bureau: true },
    });

    // Record audit log entry
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: updatedUser.name,
        userRole: updatedUser.role,
        action: 'USER_PROFILE_UPDATED',
        entityType: 'User',
        entityId: user.id,
        details: `Profile information updated for ${updatedUser.name} (${updatedUser.email}). Modified fields: ${Object.keys(updateData).filter(k => k !== 'passwordHash').join(', ')}`,
        ipAddress: req.ip || '127.0.0.1',
      },
    });

    res.json({
      id: updatedUser.id,
      employeeId: updatedUser.employeeId,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      designation: updatedUser.designation,
      bureau: updatedUser.bureau,
      bureauId: updatedUser.bureauId,
      region: updatedUser.region,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      isActive: updatedUser.isActive,
    });
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

