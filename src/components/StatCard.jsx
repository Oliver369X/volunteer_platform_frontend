'use strict';

import clsx from 'clsx';

const StatCard = ({ title, value, icon: Icon, change, changeLabel, tone = 'primary' }) => {
  const toneClasses = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{title}</p>
        {Icon ? (
          <span
            className={clsx(
              'flex h-10 w-10 items-center justify-center rounded-full',
              toneClasses[tone] ?? toneClasses.primary,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-3xl font-semibold text-ink">{value}</p>
        {change ? (
          <p className="text-xs font-medium text-muted">
            {change} {changeLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;



