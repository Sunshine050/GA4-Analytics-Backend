// backend/src/types/analytics.ts

/**
 * Types for GA4 Analytics Data
 * These interfaces define the structure of responses from GA4/BigQuery queries.
 */

// Basic analytics summary (from getAnalyticsData)
export interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  totalSessions: number;
  activeUsers: number;
  bounceRate: number;
  averageSessionDuration: number;  // In seconds
  topPages: Array<{
    page: string;
    views: number;
  }>;
}

// Realtime live users count (from getLiveUsers)
export interface LiveUsersData {
  count: number;
}

// Detailed analytics with breakdowns (from getDetailedAnalytics)
export interface DetailedAnalytics {
  chartData: Array<{
    date: string;  // YYYYMMDDHH format
    users: number;  // activeUsers
    pageViews: number;  // screenPageViews
    sessions: number;
    topPage?: string;  // Optional: Top page for this time period (add if backend supports)
  }>;
  sources: Array<{
    source: string;  // e.g., '(direct)', 'm.facebook.com'
    sessions: number;
  }>;
  pages: Array<{
    page: string;  // e.g., '/', '/services/logo'
    views: number;  // screenPageViews
  }>;
  countries: Array<{
    country: string;  // e.g., 'Thailand', '(not set)'
    users: number;  // activeUsers
  }>;
  devices: Array<{
    device: string;  // e.g., 'mobile', 'desktop'
    users: number;  // activeUsers
  }>;
}