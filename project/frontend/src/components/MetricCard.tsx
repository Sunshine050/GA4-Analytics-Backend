import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  isLive?: boolean;
}

export default function MetricCard({ label, value, icon, isLive }: MetricCardProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 transition-all hover:border-neutral-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-neutral-400 font-medium flex items-center gap-2">
          {label}
          {isLive && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            </span>
          )}
        </span>
        {icon}
      </div>
      <div className="text-3xl font-semibold text-neutral-100">{value}</div>
    </div>
  );
}
