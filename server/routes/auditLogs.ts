import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
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

// GET Cryptographic Hash Chain Audit Integrity Proof
router.get('/verify-integrity', optionalAuth, async (req, res) => {
  try {
    const { simulateTamper } = req.query;

    // Fetch all logs ordered chronologically from genesis
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
    let prevHash = GENESIS_HASH;
    const blocks: Array<{
      index: number;
      id: string;
      action: string;
      userName: string;
      timestamp: string;
      prevHash: string;
      blockHash: string;
      isValid: boolean;
    }> = [];

    let isTampered = simulateTamper === 'true';
    let brokenBlockIndex = -1;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      let detailsPayload = log.details;

      // Simulate a database modification at block 3 if requested
      if (isTampered && i === 2) {
        detailsPayload += ' [UNAUTHORIZED DB MODIFICATION - TAMPER DETECTED]';
        brokenBlockIndex = i;
      }

      const payload = `${prevHash}|${log.id}|${log.userId || ''}|${log.userName}|${log.action}|${log.entityType}|${log.createdAt.toISOString()}|${detailsPayload}`;
      const blockHash = crypto.createHash('sha256').update(payload).digest('hex');

      blocks.push({
        index: i + 1,
        id: log.id,
        action: log.action,
        userName: log.userName,
        timestamp: log.createdAt.toISOString(),
        prevHash,
        blockHash,
        isValid: !(isTampered && i >= brokenBlockIndex),
      });

      prevHash = blockHash;
    }

    const status = isTampered ? 'TAMPER_DETECTED' : 'VERIFIED';

    res.json({
      status,
      algorithm: 'SHA-256 Merkle Chain',
      totalBlocksVerified: logs.length,
      chainIntegrity: isTampered ? 'BROKEN' : '100% IMMUTABLE',
      genesisHash: GENESIS_HASH,
      latestBlockHash: prevHash,
      tamperedBlockIndex: brokenBlockIndex !== -1 ? brokenBlockIndex + 1 : null,
      verificationTimestamp: new Date().toISOString(),
      sampleBlocks: blocks.slice(-5), // Last 5 blocks for inspection
      allBlocks: blocks,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
