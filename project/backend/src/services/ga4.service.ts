import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { BigQuery } from '@google-cloud/bigquery';  // เพิ่ม import สำหรับ BigQuery
import { ga4Config } from '../config/ga4.config.js'; // ✅ แก้เป็น .js
import type { AnalyticsData, LiveUsersData, DetailedAnalytics } from '../types/analytics.js';

class GA4Service {
  private analyticsDataClient: BetaAnalyticsDataClient;
  private bigquery: BigQuery;
  private propertyId: string;

  constructor() {
    this.analyticsDataClient = new BetaAnalyticsDataClient({
      keyFilename: ga4Config.credentialsPath,
    });
    this.bigquery = new BigQuery({ keyFilename: ga4Config.credentialsPath });
    this.propertyId = `properties/${ga4Config.propertyId}`;
    console.log('[GA4Service] Initialized with propertyId:', this.propertyId);
  }

  async getAnalyticsData(startDate: string, endDate: string): Promise<AnalyticsData> {
    console.log('[GA4Service] getAnalyticsData called', { startDate, endDate });
    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: this.propertyId,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
      });

      console.log('[GA4Service] Analytics response:', response);

      const topPages = response.rows?.map(row => ({
        page: row.dimensionValues?.[0]?.value || '',
        views: parseInt(row.metricValues?.[1]?.value || '0'),
      })) || [];

      const metrics = response.rows?.[0]?.metricValues;

      const result: AnalyticsData = {
        totalVisitors: parseInt(metrics?.[0]?.value || '0'),
        totalPageViews: parseInt(metrics?.[1]?.value || '0'),
        totalSessions: parseInt(metrics?.[2]?.value || '0'),
        activeUsers: parseInt(metrics?.[3]?.value || '0'),
        bounceRate: parseFloat(metrics?.[4]?.value || '0'),
        averageSessionDuration: parseFloat(metrics?.[5]?.value || '0'),
        topPages: topPages.slice(0, 10),
      };

      console.log('[GA4Service] Analytics data parsed:', result);

      return result;
    } catch (error) {
      console.error('[GA4Service] Error fetching analytics data:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  async getLiveUsers(): Promise<LiveUsersData> {
    console.log('[GA4Service] getLiveUsers called (BigQuery)');
    try {
      const query = `
        SELECT COUNT(DISTINCT user_pseudo_id) as count
        FROM \`${ga4Config.bigQueryProjectId}.${ga4Config.bigQueryDataset}.events_*\`
        WHERE event_timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 MINUTE)
          AND event_name IN ('page_view', 'screen_view')
      `;
      const [rows] = await this.bigquery.query(query);
      const count = rows[0]?.count || 0;
      const result: LiveUsersData = { count };
      console.log('[GA4Service] Live users from BigQuery:', result);
      return result;
    } catch (error) {
      console.error('[GA4Service] BigQuery error for live users:', error);
      // Fallback ไป GA4 API เดิม
      return this.getLiveUsersFallback();
    }
  }

  private async getLiveUsersFallback(): Promise<LiveUsersData> {
    console.log('[GA4Service] Falling back to GA4 realtime');
    try {
      const [response] = await this.analyticsDataClient.runRealtimeReport({
        property: this.propertyId,
        metrics: [{ name: 'activeUsers' }],
      });

      console.log('[GA4Service] Live users response (fallback):', response);

      const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || '0';
      const result: LiveUsersData = { count: parseInt(activeUsers) };

      console.log('[GA4Service] Live users parsed (fallback):', result);

      return result;
    } catch (error) {
      console.error('[GA4Service] Fallback error for live users:', error);
      throw new Error('Failed to fetch live users data');
    }
  }

  async getDetailedAnalytics(startDate: string, endDate: string): Promise<DetailedAnalytics> {
    console.log('[GA4Service] getDetailedAnalytics called (BigQuery)', { startDate, endDate });
    try {
      // Chart data (hourly aggregate จาก BigQuery)
      const chartQuery = `
        SELECT
          FORMAT_DATE('%Y%m%d%H', TIMESTAMP_MICROS(event_timestamp)) as date,
          COUNT(DISTINCT user_pseudo_id) as users,
          COUNTIF(event_name = 'screen_view') as pageViews,
          COUNTIF(event_name = 'session_start') as sessions
        FROM \`${ga4Config.bigQueryProjectId}.${ga4Config.bigQueryDataset}.events_*\`
        WHERE _TABLE_SUFFIX BETWEEN '${startDate.replace(/-/g, '')}' AND '${endDate.replace(/-/g, '')}'
        GROUP BY date
        ORDER BY date
        LIMIT 10000
      `;
      const [chartRows] = await this.bigquery.query(chartQuery);
      const chartData = chartRows.map(row => ({
        date: row.date,
        users: row.users || 0,
        pageViews: row.pageViews || 0,
        sessions: row.sessions || 0,
      }));

      // Sources
      const sourcesQuery = `
        SELECT traffic_source.source as source, COUNTIF(event_name = 'session_start') as sessions
        FROM \`${ga4Config.bigQueryProjectId}.${ga4Config.bigQueryDataset}.events_*\`
        WHERE _TABLE_SUFFIX BETWEEN '${startDate.replace(/-/g, '')}' AND '${endDate.replace(/-/g, '')}'
        GROUP BY source
        ORDER BY sessions DESC
        LIMIT 10
      `;
      const [sourcesRows] = await this.bigquery.query(sourcesQuery);
      const sources = sourcesRows.map(row => ({
        source: row.source || '(not set)',
        sessions: row.sessions || 0,
      }));

      // Pages
      const pagesQuery = `
        SELECT (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') as page,
               COUNTIF(event_name = 'screen_view') as views
        FROM \`${ga4Config.bigQueryProjectId}.${ga4Config.bigQueryDataset}.events_*\`
        WHERE _TABLE_SUFFIX BETWEEN '${startDate.replace(/-/g, '')}' AND '${endDate.replace(/-/g, '')}'
        GROUP BY page
        ORDER BY views DESC
        LIMIT 10
      `;
      const [pagesRows] = await this.bigquery.query(pagesQuery);
      const pages = pagesRows.map(row => ({
        page: row.page || '/',
        views: row.views || 0,
      }));

      // Countries
      const countriesQuery = `
        SELECT geo.country as country, COUNT(DISTINCT user_pseudo_id) as users
        FROM \`${ga4Config.bigQueryProjectId}.${ga4Config.bigQueryDataset}.events_*\`
        WHERE _TABLE_SUFFIX BETWEEN '${startDate.replace(/-/g, '')}' AND '${endDate.replace(/-/g, '')}'
        GROUP BY country
        ORDER BY users DESC
        LIMIT 10
      `;
      const [countriesRows] = await this.bigquery.query(countriesQuery);
      const countries = countriesRows.map(row => ({
        country: row.country || '(not set)',
        users: row.users || 0,
      }));

      // Devices
      const devicesQuery = `
        SELECT device.category as device, COUNT(DISTINCT user_pseudo_id) as users
        FROM \`${ga4Config.bigQueryProjectId}.${ga4Config.bigQueryDataset}.events_*\`
        WHERE _TABLE_SUFFIX BETWEEN '${startDate.replace(/-/g, '')}' AND '${endDate.replace(/-/g, '')}'
        GROUP BY device
        ORDER BY users DESC
        LIMIT 10
      `;
      const [devicesRows] = await this.bigquery.query(devicesQuery);
      const devices = devicesRows.map(row => ({
        device: row.device || 'unknown',
        users: row.users || 0,
      }));

      const result: DetailedAnalytics = { chartData, sources, pages, countries, devices };
      console.log('[GA4Service] Detailed analytics parsed (BigQuery):', result);

      return result;
    } catch (error) {
      console.error('[GA4Service] BigQuery error fetching detailed analytics:', error);
      return this.getDetailedAnalyticsFallback(startDate, endDate);
    }
  }

  private async getDetailedAnalyticsFallback(startDate: string, endDate: string): Promise<DetailedAnalytics> {
    console.log('[GA4Service] getDetailedAnalytics fallback to GA4');
    try {
      const [mainReport] = await this.analyticsDataClient.runReport({
        property: this.propertyId,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'date' },
          { name: 'hour' },
        ],
        metrics: [
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'sessions' },
        ],
        orderBys: [
          { dimension: { dimensionName: 'date' }, desc: false },
          { dimension: { dimensionName: 'hour' }, desc: false },
        ],
        limit: 10000,
      });

      console.log('[GA4Service] Main report (fallback):', mainReport);

      const [sourcesReport] = await this.analyticsDataClient.runReport({
        property: this.propertyId,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      });

      const [pagesReport] = await this.analyticsDataClient.runReport({
        property: this.propertyId,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      });

      const [countriesReport] = await this.analyticsDataClient.runReport({
        property: this.propertyId,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10,
      });

      const [devicesReport] = await this.analyticsDataClient.runReport({
        property: this.propertyId,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 10,
      });

      const chartData = mainReport.rows?.map(row => {
        const dateStr = row.dimensionValues?.[0]?.value || '';
        const hourStr = row.dimensionValues?.[1]?.value || '00';
        const fullDateStr = dateStr.replace(/-/g, '') + hourStr.padStart(2, '0');

        return {
          date: fullDateStr,
          users: parseInt(row.metricValues?.[0]?.value || '0'),
          pageViews: parseInt(row.metricValues?.[1]?.value || '0'),
          sessions: parseInt(row.metricValues?.[2]?.value || '0'),
        };
      }) || [];

      const sources = sourcesReport.rows?.map(row => ({
        source: row.dimensionValues?.[0]?.value || 'Unknown',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      })) || [];

      const pages = pagesReport.rows?.map(row => ({
        page: row.dimensionValues?.[0]?.value || '',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
      })) || [];

      const countries = countriesReport.rows?.map(row => ({
        country: row.dimensionValues?.[0]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
      })) || [];

      const devices = devicesReport.rows?.map(row => ({
        device: row.dimensionValues?.[0]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
      })) || [];

      const result: DetailedAnalytics = { chartData, sources, pages, countries, devices };
      console.log('[GA4Service] Detailed analytics parsed (fallback):', result);

      return result;
    } catch (error) {
      console.error('[GA4Service] Fallback error fetching detailed analytics:', error);
      throw new Error('Failed to fetch detailed analytics');
    }
  }
}

export default new GA4Service();
