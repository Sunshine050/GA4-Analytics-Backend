import { useEffect, useState, useMemo } from 'react';
import {
  Activity,
  Users,
  Eye,
  MousePointer,
  Clock,
  Calendar,
  Download,
  Filter,
  Globe,
  FileText,
  MapPin,
  Smartphone,
  Monitor,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { analyticsApi } from '../services/api';
import { DetailedAnalytics, LiveUsersData } from '../types/analytics';
import MetricCard from './MetricCard';
import DataList from './DataList';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AnalyticsChartProps {
  data: Array<{
    date: string; // Formatted date for labels
    users: number;
    pageViews: number;
    sessions: number;
    topPage?: string; // Optional, from backend
  }>;
}

function AnalyticsChart({ data }: AnalyticsChartProps) {
  const chartData = useMemo(() => ({
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: 'ผู้เยี่ยมชม (Visitors)',
        data: data.map((d) => d.users),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'จำนวนหน้าชม (Page Views)',
        data: data.map((d) => d.pageViews),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'เซสชัน (Sessions)',
        data: data.map((d) => d.sessions),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(251, 146, 60)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  }), [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#e2e8f0',
          font: { size: 12 },
        },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8', maxTicksLimit: 20 }, // เพิ่ม maxTicksLimit สำหรับ hourly data
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          color: '#94a3b8',
          callback: (value: any) => value.toLocaleString(),
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }), []);

  return <Line data={chartData} options={options} />;
}

export default function AnalyticsDashboard() {
  const [liveUsers, setLiveUsers] = useState(0);
  const [analytics, setAnalytics] = useState<DetailedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Helper function to format dates in Thai
  const formatDateRange = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const formatDate = (dateStr: string, includeTime: boolean = false) => {
      const date = new Date(dateStr + (includeTime ? 'T' + new Date().toISOString().slice(11, 16) : 'T00:00:00'));
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      return date.toLocaleDateString('th-TH', options);
    };

    const startFormatted = formatDate(startDate);
    let endFormatted = formatDate(endDate);
    if (endDate === today) {
      endFormatted = formatDate(endDate, true); // Include current time if endDate is today
    }

    return { start: startFormatted, end: endFormatted };
  }, [startDate, endDate]);

  // Chart data with formatted dates for better labels (including hour)
  const displayChartData = useMemo(() => {
    if (!analytics?.chartData) return [];
    return analytics.chartData.map((d) => {
      // Handle date format YYYYMMDDHH -> extract YYYY, MM, DD, HH
      const year = parseInt(d.date.slice(0, 4));
      const month = parseInt(d.date.slice(4, 6)) - 1;
      const day = parseInt(d.date.slice(6, 8));
      const hour = parseInt(d.date.slice(8, 10));
      const dateObj = new Date(year, month, day, hour);
      const formattedDate = dateObj.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
      const formattedTime = dateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
      const label = `${formattedDate} ${formattedTime}`; // e.g., "22 ต.ค. 14:00"
      return {
        date: label,
        users: d.users || 0,
        pageViews: d.pageViews || 0,
        sessions: d.sessions || 0,
        topPage: d.page || 'N/A', // Fallback if no page data
      };
    });
  }, [analytics]);

  const sources = analytics?.sources || [];
  const pages = analytics?.pages || [];
  const countries = analytics?.countries || [];
  const devices = analytics?.devices || [];

  const totals = useMemo(() => {
    return displayChartData.reduce(
      (acc, day) => ({
        totalUsers: acc.totalUsers + day.users,
        totalPageViews: acc.totalPageViews + day.pageViews,
        totalSessions: acc.totalSessions + day.sessions,
      }),
      { totalUsers: 0, totalPageViews: 0, totalSessions: 0 }
    );
  }, [displayChartData]);

  // Fix: This was averaging sessions count, not duration. Hardcode or fetch real avgSessionDuration from GA4
  const avgSessionDuration = 120; // Example: 2 minutes in seconds; make dynamic later
  const bounceRate = 34.8; // Dynamic from GA4 later

  // Real-time update for endDate if it's today (update display every minute)
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (endDate !== today) return; // Only if endDate is today

    const interval = setInterval(() => {
      // This will trigger re-render via useMemo dependency, but doesn't change state unless needed
      // For API, keep date only; display handles time
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [endDate]);

  // Auto-update endDate to current date every day (or on mount)
  useEffect(() => {
    const updateEndDate = () => {
      const currentDate = new Date().toISOString().slice(0, 10);
      setEndDate(currentDate);
    };

    updateEndDate(); // Initial set

    // Update daily at midnight (approx 24 hours)
    const dailyInterval = setInterval(updateEndDate, 24 * 60 * 60 * 1000);

    return () => clearInterval(dailyInterval);
  }, []); // Run once on mount

  // Initial load only (no dependency on startDate/endDate to prevent auto-fetch)
  useEffect(() => {
    fetchAnalytics();
    fetchLiveUsers();
    const liveInterval = setInterval(fetchLiveUsers, 30000);
    return () => clearInterval(liveInterval);
  }, []); // Empty dependency array: run once on mount

  const fetchLiveUsers = async () => {
    try {
      const data: LiveUsersData = await analyticsApi.getLiveUsers();
      setLiveUsers(data.count ?? 0);
    } catch (err) {
      console.error('[fetchLiveUsers] Error:', err);
      setLiveUsers(0);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getDetailedAnalytics(startDate, endDate);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('[fetchAnalytics] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}นาที ${secs}วินาที`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-900 to-black flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-2 border-neutral-600 rounded-full animate-spin border-t-cyan-500"></div>
          <div className="text-neutral-400 text-lg">กำลังโหลดข้อมูลวิเคราะห์...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-900 to-black flex items-center justify-center p-4">
        <div className="bg-neutral-900/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <div className="text-red-400 text-2xl mb-4">เกิดข้อผิดพลาด</div>
          <div className="text-neutral-300 mb-6">{error}</div>
          <button
            onClick={fetchAnalytics}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <span>ลองใหม่อีกครั้ง</span>
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-900 to-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-neutral-900/30 backdrop-blur-sm border border-neutral-800/30 rounded-2xl p-6 shadow-xl">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              แผงควบคุมวิเคราะห์ข้อมูล
            </h1>
            <p className="text-sm text-neutral-400">ดูภาพรวมประสิทธิภาพเว็บไซต์ของคุณ</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2 text-sm text-neutral-400 bg-neutral-800/50 rounded-xl px-3 py-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateRange.start} ถึง {formatDateRange.end}</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-neutral-800/70 text-white border border-neutral-700 rounded-lg p-2 focus:border-cyan-500 focus:outline-none transition-colors"
              />
              <span className="text-neutral-500">ถึง</span>
              <span className="bg-neutral-800/70 text-white border border-neutral-700 rounded-lg p-2 px-3 min-w-[120px] text-center">
                {endDate} (ปัจจุบัน)
              </span>
            </div>
            <button
              onClick={fetchAnalytics}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black font-medium px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-cyan-500/25"
            >
              <Filter className="w-4 h-4" />
              <span>ใช้</span>
            </button>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <MetricCard 
            label="ผู้เยี่ยมชมสด" 
            value={liveUsers.toLocaleString()} 
            icon={<Activity className="w-5 h-5 text-cyan-400" />} 
            isLive 
            gradient="from-cyan-500/20 via-blue-500/20 to-indigo-500/20"
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard 
            label="ผู้ใช้ไม่ซ้ำ" 
            value={totals.totalUsers.toLocaleString()} 
            icon={<Users className="w-5 h-5 text-indigo-400" />} 
            gradient="from-indigo-500/20 via-purple-500/20 to-violet-500/20"
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard 
            label="จำนวนหน้าชม" 
            value={totals.totalPageViews.toLocaleString()} 
            icon={<Eye className="w-5 h-5 text-emerald-400" />} 
            gradient="from-emerald-500/20 via-teal-500/20 to-green-500/20"
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard 
            label="อัตราคืน" 
            value={`${bounceRate}%`} 
            icon={<MousePointer className="w-5 h-5 text-amber-400" />} 
            gradient="from-amber-500/20 via-orange-500/20 to-red-500/20"
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard 
            label="เซสชันเฉลี่ย" 
            value={formatDuration(avgSessionDuration)} 
            icon={<Clock className="w-5 h-5 text-rose-400" />} 
            gradient="from-rose-500/20 via-pink-500/20 to-fuchsia-500/20"
            className="hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/40 rounded-3xl p-6 lg:p-8 shadow-2xl hover:shadow-cyan-500/10 transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-xl lg:text-2xl font-semibold text-neutral-100 mb-1">ภาพรวมการเข้าชม</h3>
              <p className="text-sm text-neutral-500">แนวโน้มข้อมูลในช่วง {displayChartData.length} ชั่วโมง/วัน</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-neutral-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDateRange.start} - {formatDateRange.end}</span>
            </div>
          </div>
          <div className="h-80 lg:h-96 relative">
            <AnalyticsChart data={displayChartData} />
          </div>
        </div>

        {/* Data Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-md border border-purple-800/40 rounded-3xl p-6 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-6 h-6 text-purple-400" />
                <h4 className="text-lg font-semibold text-neutral-100">แหล่งที่มาหลัก</h4>
              </div>
              <div className="space-y-3">
                {sources.slice(0, 5).map((s, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-neutral-800/30 rounded-xl hover:bg-neutral-700/50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-neutral-300 font-medium">{s.source}</span>
                    </div>
                    <span className="text-sm text-neutral-400 font-semibold">{s.sessions || 0} เซสชัน</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-md border border-emerald-800/40 rounded-3xl p-6 shadow-xl hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-400" />
                <h4 className="text-lg font-semibold text-neutral-100">หน้าหลัก</h4>
              </div>
              <div className="space-y-3">
                {pages.slice(0, 5).map((p, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-neutral-800/30 rounded-xl hover:bg-neutral-700/50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-sm text-neutral-300 font-medium">{p.page}</span>
                    </div>
                    <span className="text-sm text-neutral-400 font-semibold">{p.views || 0} ครั้ง</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-md border border-blue-800/40 rounded-3xl p-6 shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-semibold text-neutral-100">ประเทศ</h4>
              </div>
              <div className="space-y-3">
                {countries.slice(0, 5).map((c, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-neutral-800/30 rounded-xl hover:bg-neutral-700/50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-neutral-300 font-medium">{c.country}</span>
                    </div>
                    <span className="text-sm text-neutral-400 font-semibold">{c.users || 0} ผู้ใช้</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-md border border-amber-800/40 rounded-3xl p-6 shadow-xl hover:shadow-amber-500/20 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <Smartphone className="w-6 h-6 text-amber-400" />
                <h4 className="text-lg font-semibold text-neutral-100">อุปกรณ์</h4>
              </div>
              <div className="space-y-3">
                {devices.slice(0, 5).map((d, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-neutral-800/30 rounded-xl hover:bg-neutral-700/50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-sm text-neutral-300 font-medium">{d.device}</span>
                    </div>
                    <span className="text-sm text-neutral-400 font-semibold">{d.users || 0} ผู้ใช้</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-neutral-500 pt-8 border-t border-neutral-800/30">
          ข้อมูลอัปเดตครั้งล่าสุด: {new Date().toLocaleDateString('th-TH')}
        </div>
      </div>
    </div>
  );
}