import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/error.js';
import authRoutes from './src/routes/auth.routes.js';
import resumeRoutes from './src/routes/resume.routes.js';
import interviewRoutes from './src/routes/interview.routes.js';
import dashboardRoutes from './src/routes/dashboard.routes.js';

const required = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'CLIENT_URL'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const app = express();
app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      const isAllowed =
        configuredOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin === 'http://localhost:5173' ||
        cleanOrigin === 'http://localhost:3000';

      if (isAllowed) {
        return callback(null, true);
      }
      console.warn(`[CORS] Disallowed origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB()
  .then(() => {
    const server = app.listen(port, () => console.log(`API running on :${port}`));
    const stop = () => server.close(() => mongoose.connection.close().then(() => process.exit(0)));
    process.on('SIGTERM', stop);
    process.on('SIGINT', stop);
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
