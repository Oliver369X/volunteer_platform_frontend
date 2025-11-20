'use strict';

import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import StatCard from '../components/StatCard.jsx';
import BadgeGrid from '../components/BadgeGrid.jsx';
import LeaderboardTable from '../components/LeaderboardTable.jsx';
import { formatNumber, formatPoints } from '../lib/formatters.js';
import { 
  SparklesIcon, 
  TrophyIcon, 
  ArrowTrendingUpIcon,
  FireIcon,
  BoltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';

const levelConfig = {
  BRONCE: { color: 'from-amber-400 to-amber-600', emoji: '🥉', next: 'PLATA' },
  PLATA: { color: 'from-slate-400 to-slate-600', emoji: '🥈', next: 'ORO' },
  ORO: { color: 'from-yellow-400 to-yellow-600', emoji: '🥇', next: 'PLATINO' },
  PLATINO: { color: 'from-indigo-400 to-indigo-600', emoji: '💎', next: 'MÁXIMO' },
};

const GamificationPage = () => {
  const api = useApi();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const { register, watch } = useForm({
    defaultValues: { timeframe: 'monthly' },
  });
  const timeframe = watch('timeframe');

  const loadData = async (period) => {
    try {
      setError(null);
      setLoading(true);
      const [profileData, leaderboardData] = await Promise.all([
        api.getVolunteerGamification(),
        api.getLeaderboard({ timeframe: period }),
      ]);
      setGamification(profileData);
      setLeaderboard(leaderboardData ?? []);
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
    return <LoadingSpinner label="Cargando métricas de gamificación..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  const profile = gamification?.profile ?? {};
  const currentLevel = profile.level || 'BRONCE';
  const levelInfo = levelConfig[currentLevel] || levelConfig.BRONCE;
  
  // Calcular progreso (simulado - puedes ajustar según tu lógica)
  const pointsForNextLevel = {
    BRONCE: 1000,
    PLATA: 2500,
    ORO: 5000,
    PLATINO: 10000,
  }[currentLevel] || 10000;
  
  const currentPoints = profile.totalPoints || 0;
  const progressPercent = Math.min((currentPoints / pointsForNextLevel) * 100, 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con efecto */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-primary/10 via-white to-emerald/10 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="relative">
          <PageHeader
            title={
              <span className="flex items-center gap-3 flex-wrap">
                <span>🎮 Gamificación y reconocimiento</span>
              </span>
            }
            description="Suma puntos por cada misión, desbloquea niveles y obtén badges tokenizados que acreditan tu impacto."
          />
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Nivel actual"
          value={`${levelInfo.emoji} ${currentLevel}`}
          icon={SparklesIcon}
          tone="primary"
        />
        <StatCard
          title="Puntos totales"
          value={formatPoints(currentPoints)}
          icon={TrophyIcon}
          tone="success"
          change="+125"
          changeLabel="este mes"
        />
        <StatCard
          title="Reputación"
          value={formatNumber(profile.reputationScore ?? 0)}
          icon={ArrowTrendingUpIcon}
          tone="warning"
        />
        <StatCard
          title="Badges NFT"
          value={gamification?.badges?.length || 0}
          icon={FireIcon}
          tone="neutral"
        />
      </div>

      {/* Barra de progreso de nivel */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${levelInfo.color} flex items-center justify-center text-2xl shadow-lg`}>
              {levelInfo.emoji}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                Progreso hacia {levelInfo.next}
              </p>
              <p className="text-xs text-muted">
                {currentPoints.toLocaleString()} / {pointsForNextLevel.toLocaleString()} puntos
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

        {/* Mini stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: BoltIcon, label: 'Racha', value: '7 días', color: 'text-yellow-600' },
            { icon: ChartBarIcon, label: 'Ranking', value: `#${leaderboard.findIndex(l => l.userId === user?.id) + 1 || '—'}`, color: 'text-blue-600' },
            { icon: TrophyIcon, label: 'Misiones', value: profile.experienceHours || 0, color: 'text-emerald-600' },
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="text-[10px] text-muted">{stat.label}</p>
                <p className="text-sm font-bold text-ink">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid de badges y leaderboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Badges */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              🏆 Tus insignias NFT
            </h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {gamification?.badges?.length || 0} badges
            </span>
          </div>
          <BadgeGrid badges={gamification?.badges ?? []} />
        </div>

        {/* Leaderboard */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              👥 Ranking de voluntarios
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
          <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-lg overflow-hidden">
            <LeaderboardTable items={leaderboard} currentUserId={user?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;



