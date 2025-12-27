import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyticsRoutes from './routes/analytics.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

// ---------- CORS ----------
const allowedOrigins: (string | boolean | RegExp)[] = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:5174', // เพิ่ม local dev port
  'http://localhost:8000',
  process.env.FRONTEND_URL?.replace(/\/$/, '') // production frontend, ตัด / ท้ายถ้ามี
].filter((origin): origin is string => Boolean(origin));

console.log('🔒 Allowed CORS Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ---------- Body parser ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Health check ----------
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GA4 Analytics API is running' });
});

// ---------- Routes ----------
app.use('/analytics', analyticsRoutes);

// ---------- Error handler ----------
app.use(errorHandler);

export default app;
