'use strict';

import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import StatCard from '../components/StatCard.jsx';
import BadgeGrid from '../components/BadgeGrid.jsx';
import LeaderboardTable from '../components/LeaderboardTable.jsx';
import { formatNumber, formatPoints } from '../lib/formatters.js';
import { SparklesIcon, TrophyIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';

const GamificationPage = () => {
  const api = useApi();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gamificación y reconocimiento"
        description="Suma puntos por cada misión, desbloquea niveles y obtén badges tokenizados que acreditan tu impacto."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Nivel actual"
          value={profile.level ?? '--'}
          icon={SparklesIcon}
          tone="primary"
          changeLabel=""
        />
        <StatCard
          title="Puntos totales"
          value={formatPoints(profile.totalPoints ?? 0)}
          icon={TrophyIcon}
          tone="success"
        />
        <StatCard
          title="Promedio reputación"
          value={formatNumber(profile.reputationScore ?? 0)}
          icon={ArrowTrendingUpIcon}
          tone="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Tus insignias</h2>
          <BadgeGrid badges={gamification?.badges ?? []} />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Ranking de voluntarios</h2>
            <label className="flex items-center gap-2 text-xs text-muted">
              Período
              <select
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register('timeframe')}
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
                <option value="all">Siempre</option>
              </select>
            </label>
          </div>
          <LeaderboardTable items={leaderboard} />
        </div>
      </div>
    </div>
  );
};

export default GamificationPage;



