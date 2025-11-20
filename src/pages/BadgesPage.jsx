'use strict';

import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import BadgeGrid from '../components/BadgeGrid.jsx';
import { SparklesIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline';

const BadgesPage = () => {
  const api = useApi();
  const { user } = useAuth();
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getVolunteerGamification();
        setGamification(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'VOLUNTEER') {
      fetchGamification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if (loading) {
    return <LoadingSpinner label="Cargando badges..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (user?.role !== 'VOLUNTEER') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-ink">Solo para voluntarios</h3>
          <p className="mt-2 text-sm text-muted">
            Los badges y NFTs son reconocimientos exclusivos para voluntarios.
          </p>
        </div>
      </div>
    );
  }

  const badges = gamification?.badges || [];
  const earnedBadges = badges.filter((b) => b.blockchainStatus === 'MINTED');
  const pendingBadges = badges.filter((b) => b.blockchainStatus === 'PENDING');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Badges y NFTs"
        description="Reconocimientos verificables en blockchain por tus logros y contribuciones."
      />

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CheckBadgeIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{earnedBadges.length}</p>
              <p className="text-xs text-muted">Badges Obtenidos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{pendingBadges.length}</p>
              <p className="text-xs text-muted">Pendientes de Mintar</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{gamification?.level || 'BRONCE'}</p>
              <p className="text-xs text-muted">Nivel Actual</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Obtenidos */}
      {earnedBadges.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">🏆 Badges Verificados en Blockchain</h2>
          <BadgeGrid badges={earnedBadges} showBlockchainInfo />
        </div>
      ) : null}

      {/* Badges Pendientes */}
      {pendingBadges.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">⏳ Badges Pendientes de Verificación</h2>
          <BadgeGrid badges={pendingBadges} showBlockchainInfo />
        </div>
      ) : null}

      {/* Sin Badges */}
      {badges.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
          <div className="text-center">
            <SparklesIcon className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-ink">Aún no tienes badges</h3>
            <p className="mt-2 text-sm text-muted">
              Completa misiones y alcanza logros para obtener reconocimientos verificables.
            </p>
            <button
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              onClick={() => (window.location.href = '/dashboard/tasks')}
            >
              Ver Misiones Disponibles
            </button>
          </div>
        </div>
      ) : null}

      {/* Información sobre NFTs */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-blue-900">
          <SparklesIcon className="h-5 w-5" />
          ¿Qué son los Badges NFT?
        </h3>
        <p className="mt-2 text-sm text-blue-800">
          Los badges NFT son reconocimientos digitales únicos almacenados en blockchain. Son inmutables,
          verificables y te pertenecen permanentemente. Cada badge tiene un Token ID único que prueba
          tu logro de forma transparente y descentralizada.
        </p>
      </div>
    </div>
  );
};

export default BadgesPage;


