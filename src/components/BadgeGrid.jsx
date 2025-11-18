'use strict';

const levelColors = {
  BRONCE: 'border-amber-300 bg-amber-50 text-amber-700',
  PLATA: 'border-slate-300 bg-slate-50 text-slate-700',
  ORO: 'border-yellow-300 bg-yellow-50 text-yellow-700',
  PLATINO: 'border-indigo-300 bg-indigo-50 text-indigo-700',
  ESPECIAL: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700',
};

const BadgeGrid = ({ badges = [] }) => {
  if (!badges.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-muted">
        Aún no tienes insignias registradas.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">{badge.badge?.name ?? badge.name}</p>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                levelColors[badge.badge?.level ?? badge.level] ?? 'bg-slate-100 text-slate-600'
              }`}
            >
              {badge.badge?.level ?? badge.level}
            </span>
          </div>
          <p className="text-xs text-muted">
            {badge.badge?.description ?? badge.description ?? 'Insignia sin descripción.'}
          </p>
          {badge.tokenId ? (
            <p className="truncate rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-mono text-slate-600">
              NFT: {badge.tokenId}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default BadgeGrid;



