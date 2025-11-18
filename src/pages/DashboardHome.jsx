'use strict';

import { useEffect, useMemo, useState } from 'react';
import useAuth from '../hooks/useAuth.js';
import useApi from '../hooks/useApi.js';
import StatCard from '../components/StatCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import { formatNumber, formatPoints } from '../lib/formatters.js';
import { SparklesIcon, UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const DashboardHome = () => {
  const { user } = useAuth();
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (user?.role === 'VOLUNTEER') {
          const [profile, gamification] = await Promise.all([
            api.getVolunteerProfile(),
            api.getVolunteerGamification(),
          ]);
          setOverview({ profile, gamification });
        } else if (user?.role === 'ORGANIZATION') {
          const [orgs, tasks] = await Promise.all([
            api.getOrganizationMemberships(),
            api.getTasks({ limit: 10 }),
          ]);
          setOverview({ orgs, tasks });
        } else {
          const volunteers = await api.listVolunteers({ limit: 5 });
          setOverview({ volunteers });
        }
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [api, user?.role]);

  const content = useMemo(() => {
    if (!overview) return null;
    if (user?.role === 'VOLUNTEER') {
      const { gamification } = overview;
      return (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Nivel actual"
              value={gamification?.profile?.level ?? '--'}
              icon={SparklesIcon}
              tone="primary"
            />
            <StatCard
              title="Puntos totales"
              value={formatPoints(gamification?.profile?.totalPoints ?? 0)}
              icon={ClipboardDocumentListIcon}
              tone="success"
            />
            <StatCard
              title="Asignaciones completadas"
              value={formatNumber(gamification?.profile?.experienceHours ?? 0)}
              icon={UserGroupIcon}
              tone="warning"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Recompensas recientes</h2>
            <p className="text-sm text-muted">
              Visualiza tus insignias y puntos en la pestaña de Gamificación.
            </p>
          </div>
        </div>
      );
    }

    if (user?.role === 'ORGANIZATION') {
      const { tasks } = overview;
      return (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Misiones activas"
              value={formatNumber(tasks?.length ?? 0)}
              icon={ClipboardDocumentListIcon}
            />
            <StatCard
              title="Voluntarios requeridos"
              value={formatNumber(
                tasks?.reduce((acc, task) => acc + (task.volunteersNeeded ?? 0), 0) ?? 0,
              )}
              icon={UserGroupIcon}
              tone="warning"
            />
            <StatCard
              title="Misiones completadas"
              value={formatNumber(
                tasks?.filter((task) => task.status === 'COMPLETED' || task.status === 'VERIFIED')
                  .length ?? 0,
              )}
              icon={SparklesIcon}
              tone="success"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Próximos pasos</h2>
            <p className="text-sm text-muted">
              Gestiona tus tareas, invita miembros a tu organización y utiliza el motor de IA para
              asignar recursos de forma inteligente.
            </p>
          </div>
        </div>
      );
    }

    const { volunteers } = overview;
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Voluntarios registrados" value={formatNumber(volunteers?.length ?? 0)} />
          <StatCard title="Organizaciones activas" value="—" tone="warning" />
          <StatCard title="Tareas registradas" value="—" tone="success" />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Consola administrativa</h2>
          <p className="text-sm text-muted">
            Próximamente podrás visualizar métricas globales, auditoría y gestión de políticas.
          </p>
        </div>
      </div>
    );
  }, [overview, user?.role]);

  if (loading) {
    return <LoadingSpinner label="Preparando tu panel personalizado..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-primary/10 via-white to-emerald/10 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-ink">
          Bienvenido/a, {user?.fullName ?? 'voluntario'}
        </h1>
        <p className="text-sm text-muted">
          Esta es tu consola central para coordinar misiones, visualizar métricas y celebrar logros.
        </p>
      </div>
      {content}
    </div>
  );
};

export default DashboardHome;



