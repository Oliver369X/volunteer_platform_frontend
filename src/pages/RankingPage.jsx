'use strict';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import LeaderboardTable from '../components/LeaderboardTable.jsx';
import StatCard from '../components/StatCard.jsx';
import { 
  TrophyIcon, 
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { formatNumber, formatPoints } from '../lib/formatters.js';

const levelConfig = {
  BRONCE: { color: 'from-amber-400 to-amber-600', emoji: '🥉', minPoints: 0, nextPoints: 1000 },
  PLATA: { color: 'from-slate-400 to-slate-600', emoji: '🥈', minPoints: 1000, nextPoints: 2500 },
  ORO: { color: 'from-yellow-400 to-yellow-600', emoji: '🥇', minPoints: 2500, nextPoints: 5000 },
  PLATINO: { color: 'from-indigo-400 to-indigo-600', emoji: '💎', minPoints: 5000, nextPoints: 10000 },
};

const RankingPage = () => {
  const api = useApi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRanking, setMyRanking] = useState(null);
  const [gamification, setGamification] = useState(null);
  const { register, watch } = useForm({
    defaultValues: { timeframe: 'all' },
  });
  const timeframe = watch('timeframe');

  const loadData = async (period) => {
    try {
      setError(null);
      setLoading(true);
      
      const [leaderboardData, profileData] = await Promise.all([
        api.getLeaderboard({ timeframe: period }),
        user?.role === 'VOLUNTEER' ? api.getVolunteerGamification() : Promise.resolve(null),
      ]);
      
      setLeaderboard(leaderboardData ?? []);
      setGamification(profileData);
      
      // Encontrar mi posición en el ranking
      if (user?.id && leaderboardData) {
        const myIndex = leaderboardData.findIndex((item) => item.userId === user.id);
        if (myIndex !== -1) {
          setMyRanking({
            rank: myIndex + 1,
            ...leaderboardData[myIndex],
          });
        }
      }
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(timeframe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  if (loading) {
    return <LoadingSpinner label="Cargando ranking..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  const profile = gamification?.profile ?? {};
  const currentLevel = profile.level || 'BRONCE';
  const levelInfo = levelConfig[currentLevel] || levelConfig.BRONCE;
  const currentPoints = profile.totalPoints || 0;
  const progressPercent = currentLevel !== 'PLATINO' 
    ? Math.min(((currentPoints - levelInfo.minPoints) / (levelInfo.nextPoints - levelInfo.minPoints)) * 100, 100)
    : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-primary/10 via-white to-emerald/10 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="relative">
          <PageHeader
            title={
              <span className="flex items-center gap-3 flex-wrap">
                <span>🏆 Ranking y Niveles</span>
              </span>
            }
            description="Visualiza tu posición en el ranking global y el progreso hacia el siguiente nivel"
          />
        </div>
      </div>

      {/* Mi Posición (solo para voluntarios) */}
      {user?.role === 'VOLUNTEER' && myRanking && (
        <div className="rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-3xl shadow-lg`}>
                {levelInfo.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-muted">Tu Posición</p>
                <p className="text-3xl font-bold text-primary">#{myRanking.rank}</p>
                <p className="text-sm text-muted">de {leaderboard.length} voluntarios</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xs text-muted mb-1">Nivel Actual</p>
                <p className="text-xl font-bold text-ink">{currentLevel}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted mb-1">Puntos Totales</p>
                <p className="text-xl font-bold text-primary">{formatPoints(currentPoints)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted mb-1">Reputación</p>
                <p className="text-xl font-bold text-emerald-600">{profile.reputationScore || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas de Niveles */}
      {user?.role === 'VOLUNTEER' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Nivel Actual"
            value={`${levelInfo.emoji} ${currentLevel}`}
            icon={SparklesIcon}
            tone="primary"
          />
          <StatCard
            title="Puntos Totales"
            value={formatPoints(currentPoints)}
            icon={TrophyIcon}
            tone="success"
          />
          <StatCard
            title="Mi Ranking"
            value={myRanking ? `#${myRanking.rank}` : '--'}
            icon={ChartBarIcon}
            tone="warning"
          />
          <StatCard
            title="Reputación"
            value={formatNumber(profile.reputationScore ?? 0)}
            icon={ArrowTrendingUpIcon}
            tone="neutral"
          />
        </div>
      )}

      {/* Barra de Progreso de Nivel */}
      {user?.role === 'VOLUNTEER' && currentLevel !== 'PLATINO' && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-2xl shadow-lg`}>
                {levelInfo.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  Progreso hacia {Object.keys(levelConfig).find((l, i) => Object.keys(levelConfig)[i + 1] === currentLevel) || 'PLATINO'}
                </p>
                <p className="text-xs text-muted">
                  {currentPoints.toLocaleString()} / {levelInfo.nextPoints.toLocaleString()} puntos
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {progressPercent.toFixed(0)}%
              </p>
              <p className="text-xs text-muted">Completado</p>
            </div>
          </div>
          
          {/* Barra de progreso animada */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary-dark shadow-lg transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Niveles */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
          <FireIcon className="h-6 w-6 text-orange-500" />
          Sistema de Niveles
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(levelConfig).map(([level, config]) => {
            const isCurrent = level === currentLevel;
            return (
              <div
                key={level}
                className={`rounded-xl border-2 p-4 transition-all ${
                  isCurrent
                    ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg scale-105'
                    : 'border-slate-200 bg-white hover:shadow-md'
                }`}
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-lg mb-3`}>
                  {config.emoji}
                </div>
                <p className={`text-lg font-bold ${isCurrent ? 'text-primary' : 'text-ink'}`}>
                  {level}
                </p>
                <p className="text-xs text-muted mt-1">
                  {config.minPoints.toLocaleString()} - {config.nextPoints.toLocaleString()} pts
                </p>
                {isCurrent && (
                  <p className="text-xs font-semibold text-primary mt-2">Nivel Actual</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking Global */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <TrophyIcon className="h-6 w-6 text-yellow-500" />
              Ranking Global de Voluntarios
            </h2>
            <label className="flex items-center gap-2 text-xs font-semibold text-muted">
              <span>Período:</span>
              <select
                className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                {...register('timeframe')}
              >
                <option value="weekly">📅 Semanal</option>
                <option value="monthly">📆 Mensual</option>
                <option value="yearly">🗓️ Anual</option>
                <option value="all">♾️ Siempre</option>
              </select>
            </label>
          </div>
        </div>
        <div className="p-4">
          <LeaderboardTable items={leaderboard} currentUserId={user?.id} />
        </div>
      </div>
    </div>
  );
};

export default RankingPage;

