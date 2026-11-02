import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import institutionRoutes from './routes/institutions';
import complaintRoutes from './routes/complaints';
import overlapRoutes from './routes/overlaps';
import bureauRoutes from './routes/bureaus';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import userRoutes from './routes/users';
import auditLogRoutes from './routes/auditLogs';
import settingRoutes from './routes/settings';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/overlaps', overlapRoutes);
app.use('/api/bureaus', bureauRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/settings', settingRoutes);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'AICTE Unified Grievance Monitoring System (AUGMS)',
    version: '2.0.0-SIH',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🏛️  AICTE AUGMS API Backend running on http://localhost:${PORT}`);
});

export default app;
