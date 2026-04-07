import React from "react";
import { motion } from "framer-motion";

export interface MetricCardProps {
  title: string;
  value: string;
  trend?: string; // e.g. +2.6%
  icon: React.ReactNode;
  gradient: string; // tailwind gradient stops, e.g. "from-sky-50 via-sky-100 to-sky-200"
  lineColor: string;
  onClick?: () => void;
  subtitle?: React.ReactNode; // optional small line below value
  iconClassName?: string; // allow tint override for icon container
}

// simple pseudo-random sparkline points; regenerated per module load
const sparkPoints = Array.from({ length: 24 }).map((_, i) => {
  const base = Math.sin(i / 3.2) * 6 + 14 + Math.random() * 2;
  return base;
});

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  icon,
  gradient,
  lineColor,
  onClick,
  subtitle,
  iconClassName,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      className={`relative group rounded-xl p-5 bg-gradient-to-br ${gradient} shadow-sm ${onClick ? 'cursor-pointer' : 'cursor-default'} select-none overflow-hidden`}
    >
      {/* dotted pattern overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-overlay">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" className="text-white/40" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Icon + trend */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={"w-10 h-10 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm ring-1 ring-white/40 " + (iconClassName ?? 'text-sky-700')}>
          {icon}
        </div>
        {typeof trend === 'string' && trend.length > 0 && (
          <div className={`text-xs font-medium ${trend.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>{trend}</div>
        )}
      </div>

      <div className="relative z-10">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 drop-shadow-sm">{title}</h4>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{value}</div>
        {subtitle ? (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">{subtitle}</div>
        ) : null}
      </div>

      {/* sparkline */}
      <div className="mt-4 h-12 relative z-10">
        <svg viewBox="0 0 120 40" className="w-full h-full">
          <polyline
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            strokeLinecap="round"
            points={sparkPoints.map((p, i) => `${(i / (sparkPoints.length - 1)) * 120},${40 - p}`).join(' ')}
            className="transition-all duration-500"
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default MetricCard;
