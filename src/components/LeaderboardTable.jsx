'use strict';

import { TrophyIcon, FireIcon, BoltIcon } from '@heroicons/react/24/outline';

const rankMedals = {
  1: { emoji: '🥇', color: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  2: { emoji: '🥈', color: 'from-slate-400 to-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  3: { emoji: '🥉', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
};

const levelEmojis = {
  BRONCE: '🥉',
  PLATA: '🥈',
  ORO: '🥇',
  PLATINO: '💎',
};

const LeaderboardTable = ({ items = [], currentUserId }) => {
  if (!items.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-slate-100 p-4">
            <TrophyIcon className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Sin datos disponibles</p>
            <p className="text-xs text-muted mt-1">
              No hay información para el período seleccionado
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {items.map((item, index) => {
        const rankStyle = rankMedals[item.rank];
        const isCurrentUser = item.userId === currentUserId;
        const isTopThree = item.rank <= 3;
        
        return (
          <div
            key={item.volunteerId}
            className={`
              group relative overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300
              hover:shadow-lg hover:scale-[1.02] animate-slide-up
              ${isCurrentUser 
                ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-md' 
                : rankStyle 
                  ? `${rankStyle.border} ${rankStyle.bg}` 
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }
            `}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              {/* Rank badge */}
              <div className="flex-shrink-0">
                {rankStyle ? (
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-xl
                    bg-gradient-to-br ${rankStyle.color} shadow-lg
                  `}>
                    <span className="text-2xl">{rankStyle.emoji}</span>
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-600">
                    #{item.rank}
                  </div>
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-bold truncate ${isCurrentUser ? 'text-primary' : 'text-ink'}`}>
                    {item.fullName}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs font-semibold text-primary">(Tú)</span>
                    )}
                  </p>
                  {isTopThree && !rankStyle && (
                    <FireIcon className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                
                {/* Stats mini */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-base">{levelEmojis[item.level] || '🎖️'}</span>
                    <span className="font-semibold text-muted">{item.level}</span>
                  </div>
                  
                  <div className="h-3 w-px bg-slate-300" />
                  
                  <div className="flex items-center gap-1">
                    <TrophyIcon className="h-3 w-3 text-yellow-600" />
                    <span className="font-bold text-ink">
                      {(item.totalPoints || 0).toLocaleString()}
                    </span>
                    <span className="text-muted">pts</span>
                  </div>

                  {item.timeframePoints !== undefined && (
                    <>
                      <div className="h-3 w-px bg-slate-300 hidden sm:block" />
                      
                      <div className="hidden sm:flex items-center gap-1">
                        <BoltIcon className="h-3 w-3 text-blue-600" />
                        <span className="font-semibold text-blue-600">
                          +{item.timeframePoints.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Trend indicator */}
              {item.timeframePoints !== undefined && (
                <div className="hidden md:flex flex-col items-end">
                  <div className="rounded-lg bg-emerald-100 px-2 py-1">
                    <p className="text-xs font-bold text-emerald-700">
                      +{item.timeframePoints}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted mt-1">Este período</p>
                </div>
              )}
            </div>

            {/* Highlight effect for current user */}
            {isCurrentUser && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LeaderboardTable;



