import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyticsRoutes from './routes/analytics.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

// ✅ CORS
// อ่าน frontend URL จาก .env (local + production)
// ใช้ type guard filter เพื่อให้ TypeScript รู้ว่าไม่มี undefined
const allowedOrigins: (string | boolean | RegExp)[] = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:5174', // เพิ่มถ้ามี
  process.env.VITE_FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'GA4 Analytics API is running' });
});

// Routes
app.use('/analytics', analyticsRoutes);

// Error handler
app.use(errorHandler);

export default app;
