import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlightColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    rose: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    indigo: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400',
  };

  const borderHover = onClick ? 'hover:border-slate-500 cursor-pointer transition-all duration-200' : '';

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-xl p-5 border flex flex-col justify-between ${borderHover}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[highlightColor]}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
