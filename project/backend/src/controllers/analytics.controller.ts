import { Request, Response } from 'express';
import ga4Service from '../services/ga4.service';

export class AnalyticsController {
  async getAnalytics(req: Request, res: Response) {
    try {
      const startDate = (req.query.start as string) || '30daysAgo';
      const endDate = (req.query.end as string) || 'today';

      const data = await ga4Service.getAnalyticsData(startDate, endDate);

      res.json(data);
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      res.status(500).json({
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getLiveUsers(req: Request, res: Response) {
    try {
      const data = await ga4Service.getLiveUsers();

      res.json(data);
    } catch (error) {
      console.error('Error in getLiveUsers:', error);
      res.status(500).json({
        error: 'Failed to fetch live users data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getDetailedAnalytics(req: Request, res: Response) {
    try {
      const startDate = (req.query.start as string) || '30daysAgo';
      const endDate = (req.query.end as string) || 'today';

      const data = await ga4Service.getDetailedAnalytics(startDate, endDate);

      res.json(data);
    } catch (error) {
      console.error('Error in getDetailedAnalytics:', error);
      res.status(500).json({
        error: 'Failed to fetch detailed analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new AnalyticsController();
