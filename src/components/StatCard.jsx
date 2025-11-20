'use strict';

import clsx from 'clsx';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, change, changeLabel, tone = 'primary' }) => {
  const toneConfig = {
    primary: {
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconText: 'text-white',
      border: 'border-blue-100',
      glow: 'hover:shadow-blue-200',
      accent: 'bg-blue-50',
    },
    success: {
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconText: 'text-white',
      border: 'border-emerald-100',
      glow: 'hover:shadow-emerald-200',
      accent: 'bg-emerald-50',
    },
    warning: {
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconText: 'text-white',
      border: 'border-amber-100',
      glow: 'hover:shadow-amber-200',
      accent: 'bg-amber-50',
    },
    neutral: {
      iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
      iconText: 'text-white',
      border: 'border-slate-100',
      glow: 'hover:shadow-slate-200',
      accent: 'bg-slate-50',
    },
  };

  const config = toneConfig[tone] || toneConfig.primary;
  const changeValue = parseFloat(change);
  const isPositive = !isNaN(changeValue) && changeValue > 0;
  const isNegative = !isNaN(changeValue) && changeValue < 0;

  return (
    <div 
      className={clsx(
        'group relative flex flex-col gap-4 rounded-2xl border-2 bg-white p-5 shadow-lg',
        'transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]',
        'animate-fade-in overflow-hidden',
        config.border,
        config.glow
      )}
    >
      {/* Fondo decorativo */}
      <div className={clsx(
        'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20',
        config.accent
      )} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted/80 mb-1">
            {title}
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-ink transition-all duration-300 group-hover:scale-105">
            {value}
          </p>
        </div>
        
        {Icon && (
          <div className={clsx(
            'flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl shadow-lg',
            'transition-all duration-300 group-hover:scale-110 group-hover:rotate-6',
            config.iconBg
          )}>
            <Icon className={clsx('h-6 w-6 sm:h-7 sm:w-7', config.iconText)} />
          </div>
        )}
      </div>

      {/* Cambio/Trend */}
      {(change || changeLabel) && (
        <div className="relative flex items-center gap-2">
          {!isNaN(changeValue) && (
            <div className={clsx(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
              isPositive && 'bg-green-100 text-green-700',
              isNegative && 'bg-red-100 text-red-700',
              !isPositive && !isNegative && 'bg-slate-100 text-slate-700'
            )}>
              {isPositive && <ArrowTrendingUpIcon className="h-3 w-3" />}
              {isNegative && <ArrowTrendingDownIcon className="h-3 w-3" />}
              <span>{change}</span>
            </div>
          )}
          {changeLabel && (
            <p className="text-xs text-muted">
              {changeLabel}
            </p>
          )}
        </div>
      )}

      {/* Línea decorativa inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 transition-opacity" 
           style={{ color: config.iconBg }} 
      />
    </div>
  );
};

export default StatCard;



