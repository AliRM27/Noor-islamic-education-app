import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { generalRateLimit } from './middleware/rateLimit';

// Routes
import authRoutes from './routes/auth';
import topicRoutes from './routes/topics';
import lessonRoutes from './routes/lessons';
import progressRoutes from './routes/progress';
import userRoutes from './routes/users';
import shopRoutes from './routes/shop';
import parentRoutes from './routes/parent';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noor';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '10kb' }));
app.use(generalRateLimit);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Noor API', version: '1.0.0' });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/parent', parentRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Connect to MongoDB & start server ────────────────────────────────────────
const start = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ Connected to MongoDB: ${MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`🌙 Noor API running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1);
  }
};

start();

export default app;
