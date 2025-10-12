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
  process.env.FRONTEND_URL?.replace(/\/$/, '') // production frontend, ตัด / ท้ายถ้ามี
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
  origin: allowedOrigins,
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
