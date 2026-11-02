import { Router } from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { seedDatabase } from '../seed';

const router = Router();

// In-memory runtime configuration with realistic defaults
let systemSettings = {
  overlapThreshold: 60,
  temporalProximityDays: 90,
  slaDays: 30,
  autoScanOnRegistration: true,
  emailAlertsEnabled: true,
  crossBureauCommitteeThreshold: 85,
  escalationOfficer: 'Senior Monitoring Advisor',
};

router.get('/', (_req, res) => {
  res.json(systemSettings);
});

router.post('/', authenticateJWT, requireRole(['SUPER_ADMIN']), (req, res) => {
  const updates = req.body;
  systemSettings = { ...systemSettings, ...updates };
  res.json({ success: true, settings: systemSettings, message: 'Settings updated successfully' });
});

// Reset Demo Data endpoint
router.post('/reset-demo-data', authenticateJWT, requireRole(['SUPER_ADMIN']), async (_req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'AICTE AUGMS Demo data reset to pristine state successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

