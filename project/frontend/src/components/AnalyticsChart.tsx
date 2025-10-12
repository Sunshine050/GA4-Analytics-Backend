import { useMemo } from 'react';

interface ChartDataPoint {
  date: string;
  users: number;
  pageViews: number;
  sessions: number;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const { maxValue, points, labels } = useMemo(() => {
    if (!data.length) return { maxValue: 0, points: [], labels: [] };

    const maxUsers = Math.max(...data.map(d => d.users));
    const maxPageViews = Math.max(...data.map(d => d.pageViews));
    const maxVal = Math.max(maxUsers, maxPageViews);

    const chartHeight = 200;
    const chartWidth = 1000;
    const stepX = chartWidth / Math.max(data.length - 1, 1);

    const usersPoints = data.map((d, i) => ({
      x: i * stepX,
      y: chartHeight - (d.users / maxVal) * chartHeight,
    }));

    const pageViewsPoints = data.map((d, i) => ({
      x: i * stepX,
      y: chartHeight - (d.pageViews / maxVal) * chartHeight,
    }));

    const createPath = (points: { x: number; y: number }[]) => {
      if (!points.length) return '';
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    };

    const dateLabels = data.map(d => {
      const date = new Date(d.date.slice(0, 4), parseInt(d.date.slice(4, 6)) - 1, parseInt(d.date.slice(6, 8)));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      maxValue: maxVal,
      points: {
        users: createPath(usersPoints),
        pageViews: createPath(pageViewsPoints),
      },
      labels: dateLabels,
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500">
        No data available
      </div>
    );
  }

  const startDate = data[0]?.date ? new Date(
    data[0].date.slice(0, 4),
    parseInt(data[0].date.slice(4, 6)) - 1,
    parseInt(data[0].date.slice(6, 8))
  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  const endDate = data[data.length - 1]?.date ? new Date(
    data[data.length - 1].date.slice(0, 4),
    parseInt(data[data.length - 1].date.slice(4, 6)) - 1,
    parseInt(data[data.length - 1].date.slice(6, 8))
  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-neutral-100">Traffic Overview</h3>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-neutral-400">Page Views</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span className="text-neutral-400">Visitors</span>
          </div>
        </div>
      </div>

      <div className="relative" style={{ height: '200px' }}>
        <svg
          viewBox="0 0 1000 200"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {points.pageViews && (
            <>
              <path
                d={`${points.pageViews} L 1000 200 L 0 200 Z`}
                fill="url(#purpleGradient)"
              />
              <path
                d={points.pageViews}
                fill="none"
                stroke="rgb(168, 85, 247)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}

          {points.users && (
            <>
              <path
                d={`${points.users} L 1000 200 L 0 200 Z`}
                fill="url(#cyanGradient)"
              />
              <path
                d={points.users}
                fill="none"
                stroke="rgb(34, 211, 238)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>
      </div>

      <div className="flex justify-between text-sm text-neutral-500 pt-2">
        <span>{startDate}</span>
        <span>{endDate}</span>
      </div>
    </div>
  );
}
