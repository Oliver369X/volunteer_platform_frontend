'use strict';

import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import BadgeGrid from '../components/BadgeGrid.jsx';
import CreateBadgeModal from '../components/CreateBadgeModal.jsx';
import { SparklesIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline';

const BadgesPage = () => {
  const api = useApi();
  const { user } = useAuth();
  const [gamification, setGamification] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user?.role === 'VOLUNTEER') {
          const data = await api.getVolunteerGamification();
          setGamification(data);
        } else if (user?.role === 'ORGANIZATION' || user?.role === 'ADMIN') {
          // Organizations load all badges
          const response = await api.listBadges();
          const badgesList = Array.isArray(response) ? response : response?.data || [];
          setBadges(badgesList);
        }
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // Organizations can create badges, volunteers can view their badges
  const isOrganization = user?.role === 'ORGANIZATION' || user?.role === 'ADMIN';
  const isVolunteer = user?.role === 'VOLUNTEER';

  // Only show loading/error for volunteers
  if (isVolunteer && loading) {
    return <LoadingSpinner label="Cargando badges..." />;
  }

  if (isVolunteer && error) {
    return <ErrorAlert message={error} />;
  }

  if (!isOrganization && !isVolunteer) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-ink">Acceso restringido</h3>
          <p className="mt-2 text-sm text-muted">
            Esta sección es solo para organizaciones y voluntarios.
          </p>
        </div>
      </div>
    );
  }

  // For volunteers: badges from gamification
  // For organizations: all badges
  const volunteerBadges = gamification?.badges || [];
  const allBadges = isOrganization ? badges : volunteerBadges;
  // Mostrar todos los badges ganados, no solo los MINTED
  const earnedBadges = volunteerBadges.filter((b) => 
    b.blockchainStatus === 'MINTED' || b.blockchainStatus === 'PENDING' || !b.blockchainStatus
  );
  const pendingBadges = volunteerBadges.filter((b) => 
    b.blockchainStatus === 'PENDING'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOrganization ? 'Gestión de Badges NFT' : 'Mis Badges y NFTs'}
        description={
          isOrganization
            ? 'Crea y gestiona badges NFT para reconocer a los voluntarios.'
            : 'Reconocimientos verificables en blockchain por tus logros y contribuciones.'
        }
        actions={
          isOrganization ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark"
            >
              ✨ Crear Badge
            </button>
          ) : null
        }
      />

      {/* Estadísticas - Solo para voluntarios */}
      {isVolunteer && (
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
      )}

      {/* Badges Obtenidos - Solo para voluntarios */}
      {earnedBadges.length > 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">🏆 Mis Badges Obtenidos ({earnedBadges.length})</h2>
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

      {/* Badges List - Para organizaciones */}
      {isOrganization && allBadges.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-ink">✨ Badges Creados ({allBadges.length})</h2>
          <BadgeGrid badges={allBadges} showBlockchainInfo={false} />
        </div>
      )}

      {isOrganization && allBadges.length === 0 && (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
          <div className="text-center">
            <SparklesIcon className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-ink">Aún no has creado badges</h3>
            <p className="mt-2 text-sm text-muted">
              Crea badges NFT para reconocer a los voluntarios por sus logros.
            </p>
            <button
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              onClick={() => setIsCreateModalOpen(true)}
            >
              ✨ Crear Primer Badge
            </button>
          </div>
        </div>
      )}

      {/* Sin Badges - Solo para voluntarios */}
      {isVolunteer && volunteerBadges.length === 0 ? (
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

      {/* Create Badge Modal */}
      {isOrganization && (
        <CreateBadgeModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onBadgeCreated={(badge) => {
            setIsCreateModalOpen(false);
            // Reload badges list
            if (isOrganization) {
              api.listBadges().then((response) => {
                const badgesList = Array.isArray(response) ? response : response?.data || [];
                setBadges(badgesList);
              });
            }
          }}
          api={api}
        />
      )}
    </div>
  );
};

export default BadgesPage;


