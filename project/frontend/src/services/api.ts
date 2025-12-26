import { AnalyticsData, LiveUsersData, DetailedAnalytics } from '../types/analytics';

// ใช้ base URL จาก environment variable (เช่นของ Koyeb / Render)
const API_BASE =
  (import.meta as any).env?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3001';

console.log('[analyticsApi] Using API BASE =>', API_BASE);

export const analyticsApi = {
  // -----------------------------
  //   SUMMARY ANALYTICS (NEW)
  // -----------------------------
  async getSummaryAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);

    const response = await fetch(`${API_BASE}/analytics?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch summary analytics');
    }

    return response.json();
  },

  // -----------------------------
  //   ORIGINAL getAnalytics()
  // -----------------------------
  async getAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);

    const response = await fetch(`${API_BASE}/analytics?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    return response.json();
  },

  // -----------------------------
  //   LIVE USERS
  // -----------------------------
  async getLiveUsers(): Promise<LiveUsersData> {
    const response = await fetch(`${API_BASE}/analytics/live`);

    if (!response.ok) {
      throw new Error('Failed to fetch live users');
    }

    return response.json();
  },

  // -----------------------------
  //   DETAILED ANALYTICS
  // -----------------------------
  async getDetailedAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<DetailedAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);

    const response = await fetch(`${API_BASE}/analytics/detailed?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch detailed analytics');
    }

    return response.json();
  },
};

export default analyticsApi;
