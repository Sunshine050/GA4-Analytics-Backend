import { Router } from 'express';
import AnalyticsController from '../controllers/analytics.controller.js';

const router = Router();

router.get('/', AnalyticsController.getAnalytics);
router.get('/live', AnalyticsController.getLiveUsers);
router.get('/detailed', AnalyticsController.getDetailedAnalytics);

export default router;
