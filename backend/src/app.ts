import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import leagueRoutes from './routes/league.routes';
import matchRoutes from './routes/match.routes';
import predictionRoutes from './routes/prediction.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import syncRoutes from './routes/sync.routes';
import { startCronJobs } from './cron';
import { pool } from './db/pool';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/sync', syncRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — catches unhandled errors in route handlers
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Catch unhandled promise rejections so the process doesn't silently die
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Tribün API running on port ${PORT}`);
  startCronJobs();
});

// Graceful shutdown — close DB pool and stop accepting new connections
function shutdown() {
  server.close(() => {
    pool.end().then(() => process.exit(0)).catch(() => process.exit(1));
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
