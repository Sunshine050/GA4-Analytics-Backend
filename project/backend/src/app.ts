import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app: Application = express();

// CORS – แก้ origin ให้ตรง frontend port (เพิ่ม 5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],  // Array สำหรับ multiple ports
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