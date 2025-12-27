import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  isLive?: boolean;
  gradient?: string;
  className?: string;
}

export default function MetricCard({ label, value, icon, isLive, gradient, className }: MetricCardProps) {
  return (
    <div className={`bg-neutral-900/40 backdrop-blur-md border border-neutral-800/40 rounded-3xl p-6 transition-all duration-300 relative group overflow-hidden ${className}`}>
      {gradient && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-neutral-400 font-medium flex items-center gap-2">
            {label}
            {isLive && (
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                <span className="text-[10px] text-cyan-400 font-bold tracking-wider">LIVE</span>
              </span>
            )}
          </span>
          <div className="p-2 bg-neutral-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-neutral-100 group-hover:translate-x-1 transition-transform duration-300">{value}</div>
      </div>
    </div>
  );
}
