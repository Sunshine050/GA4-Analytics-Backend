export interface AnalyticsData {
  totalVisitors: number;
  totalPageViews: number;
  totalSessions: number;
  activeUsers: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: { page: string; views: number }[];
}

export interface LiveUsersData {
  count: number;
}

export interface DetailedAnalytics {
  chartData: {
    date: string;
    users: number;
    pageViews: number;
    sessions: number;
  }[];
  sources: {
    source: string;
    sessions: number;
  }[];
  pages: {
    page: string;
    views: number;
  }[];
  countries: {
    country: string;
    users: number;
  }[];
  devices: {
    device: string;
    users: number;
  }[];
}
