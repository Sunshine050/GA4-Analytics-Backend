import { AnalyticsData, LiveUsersData, DetailedAnalytics } from '../types/analytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/analytics';

export const analyticsApi = {
  async getAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);

    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }
    return response.json();
  },

  async getLiveUsers(): Promise<LiveUsersData> {
    const response = await fetch(`${API_URL}/live`);
    if (!response.ok) {
      throw new Error('Failed to fetch live users');
    }
    return response.json();
  },

  async getDetailedAnalytics(startDate?: string, endDate?: string): Promise<DetailedAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);

    const response = await fetch(`${API_URL}/detailed?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch detailed analytics');
    }
    return response.json();
  },
};