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
  }, [ ]);

  const content = useMemo(() => {
    if (!overview) return null;
    if (user?.role === 'VOLUNTEER') {
      const { gamification } = overview;
      return (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              change="+45"
              changeLabel="esta semana"
            />
            <StatCard
              title="Asignaciones completadas"
              value={formatNumber(gamification?.profile?.experienceHours ?? 0)}
              icon={UserGroupIcon}
              tone="warning"
            />
          </div>
          
          {/* Cards de acciones rápidas */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/dashboard/gamification"
              className="group relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">🎮 Gamificación</h3>
                <p className="text-sm text-muted">
                  Visualiza tus badges NFT, puntos y ranking
                </p>
              </div>
            </a>

            <a
              href="/dashboard/tasks"
              className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">📋 Mis Tareas</h3>
                <p className="text-sm text-muted">
                  Administra tus misiones activas
                </p>
              </div>
            </a>

            <a
              href="/dashboard/badges"
              className="group relative overflow-hidden rounded-2xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
              <div className="relative">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-ink mb-1">🏆 Badges NFT</h3>
                <p className="text-sm text-muted">
                  Colección de logros tokenizados
                </p>
              </div>
            </a>
          </div>
        </div>
      );
    }

    if (user?.role === 'ORGANIZATION') {
      const { tasks } = overview;
      const completedTasks = tasks?.filter((task) => task.status === 'COMPLETED' || task.status === 'VERIFIED').length ?? 0;
      const totalVolunteersNeeded = tasks?.reduce((acc, task) => acc + (task.volunteersNeeded ?? 0), 0) ?? 0;
      
      return (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Misiones activas"
              value={formatNumber(tasks?.length ?? 0)}
              icon={ClipboardDocumentListIcon}
              tone="primary"
            />
            <StatCard
              title="Voluntarios requeridos"
              value={formatNumber(totalVolunteersNeeded)}
              icon={UserGroupIcon}
              tone="warning"
            />
            <StatCard
              title="Misiones completadas"
              value={formatNumber(completedTasks)}
              icon={SparklesIcon}
              tone="success"
              change="+3"
              changeLabel="este mes"
            />
          </div>

          {/* Cards de acciones rápidas para organizaciones */}
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="/dashboard/tasks"
              className="group relative overflow-hidden rounded-2xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex-shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <ClipboardDocumentListIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink mb-1">📋 Gestionar Tareas</h3>
                  <p className="text-sm text-muted">
                    Crea y administra misiones de emergencia
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/dashboard/matching"
              className="group relative overflow-hidden rounded-2xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex-shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <UserGroupIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink mb-1">🤖 Matching con IA</h3>
                  <p className="text-sm text-muted">
                    Encuentra voluntarios perfectos con inteligencia artificial
                  </p>
                </div>
              </div>
            </a>
          </div>

          {/* Info destacada */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 shadow-lg">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink mb-2">🎯 Próximos pasos</h2>
                <p className="text-sm text-muted mb-4">
                  Gestiona tus tareas, invita miembros a tu organización y utiliza el motor de IA para
                  asignar recursos de forma inteligente.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="/dashboard/reports" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                    📊 Ver reportes
                  </a>
                  <a href="/dashboard/volunteers" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200">
                    👥 Ver voluntarios
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const { volunteers } = overview;
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            title="Voluntarios registrados" 
            value={formatNumber(volunteers?.length ?? 0)} 
            icon={UserGroupIcon}
            tone="primary"
          />
          <StatCard 
            title="Organizaciones activas" 
            value="—" 
            icon={ClipboardDocumentListIcon}
            tone="warning" 
          />
          <StatCard 
            title="Tareas registradas" 
            value="—" 
            icon={SparklesIcon}
            tone="success" 
          />
        </div>
        
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 shadow-lg">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-ink mb-2">👑 Consola administrativa</h2>
              <p className="text-sm text-muted mb-4">
                Panel de control para gestionar la plataforma. Visualiza métricas globales, auditoría y gestión de políticas.
              </p>
              <div className="flex flex-wrap gap-2">
                <a href="/dashboard/reports" className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-200">
                  📊 Reportes del sistema
                </a>
                <a href="/dashboard/volunteers" className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-200">
                  👥 Gestionar usuarios
                </a>
              </div>
            </div>
          </div>
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
    <div className="space-y-6 animate-fade-in">
      {/* Hero section mejorado */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-primary/10 via-white to-emerald/10 p-6 sm:p-8 shadow-xl">
        {/* Efectos decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-xl ring-4 ring-white">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
              ¡Bienvenido/a, {user?.fullName ?? 'voluntario'}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-2xl">
              Esta es tu consola central para coordinar misiones, visualizar métricas y celebrar logros. 
              {user?.role === 'VOLUNTEER' && ' ¡Sigue acumulando puntos y desbloquea nuevos badges NFT!'}
              {user?.role === 'ORGANIZATION' && ' Gestiona tus tareas y encuentra los mejores voluntarios con IA.'}
            </p>
          </div>

          {/* Rol badge */}
          <div className="flex-shrink-0">
            <div className="rounded-2xl border-2 border-white bg-white/80 backdrop-blur-sm px-4 py-3 shadow-lg">
              <p className="text-xs font-semibold text-muted mb-1">Tu rol</p>
              <p className="text-lg font-bold text-primary">
                {user?.role === 'VOLUNTEER' && '🎯 Voluntario'}
                {user?.role === 'ORGANIZATION' && '🏢 Organización'}
                {user?.role === 'ADMIN' && '👑 Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content específico por rol */}
      {content}
    </div>
  );
};

export default DashboardHome;



