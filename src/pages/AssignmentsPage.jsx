'use strict';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import AssignmentCard from '../components/AssignmentCard.jsx';
import CompleteAssignmentModal from '../components/CompleteAssignmentModal.jsx';
import BadgeEarnedModal from '../components/BadgeEarnedModal.jsx';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

const STATUS_FILTERS = [
  { value: '', label: 'Todas', icon: null },
  { value: 'PENDING', label: 'Pendientes', icon: ClockIcon },
  { value: 'ACCEPTED,IN_PROGRESS', label: 'Activas', icon: CheckCircleIcon },
  { value: 'COMPLETED,VERIFIED', label: 'Completadas', icon: CheckCircleIcon },
  { value: 'REJECTED', label: 'Rechazadas', icon: XCircleIcon },
];

const AssignmentsPage = () => {
  const api = useApi();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const { register, watch } = useForm({
    defaultValues: { status: '' },
  });
  const statusFilter = watch('status');

  const loadAssignments = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMyAssignments(filters);
      setAssignments(Array.isArray(data) ? data : data?.assignments ?? []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'VOLUNTEER') {
      loadAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if (statusFilter && user?.role === 'VOLUNTEER') {
      loadAssignments({ status: statusFilter });
    } else if (user?.role === 'VOLUNTEER') {
      loadAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleAccept = async (assignmentId) => {
    try {
      await api.acceptAssignment(assignmentId);
      await loadAssignments({ status: statusFilter });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (assignmentId, reason) => {
    try {
      await api.rejectAssignment(assignmentId, reason);
      await loadAssignments({ status: statusFilter });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenComplete = (assignment) => {
    setSelectedAssignment(assignment);
    setIsCompleteModalOpen(true);
  };

  const handleCompleted = () => {
    setIsCompleteModalOpen(false);
    setSelectedAssignment(null);
    loadAssignments({ status: statusFilter });
  };

  if (user?.role !== 'VOLUNTEER') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <ClockIcon className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-ink">Solo para voluntarios</h3>
          <p className="mt-2 text-sm text-muted">
            Las asignaciones son visibles únicamente para usuarios con rol de voluntario.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner label="Cargando tus asignaciones..." fullPage={false} />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  const pendingCount = assignments.filter((a) => a.status === 'PENDING').length;
  const activeCount = assignments.filter((a) =>
    ['ACCEPTED', 'IN_PROGRESS'].includes(a.status),
  ).length;
  const completedCount = assignments.filter((a) =>
    ['COMPLETED', 'VERIFIED'].includes(a.status),
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con estadísticas */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="relative">
          <PageHeader
            title="📋 Mis Asignaciones"
            description="Gestiona tus misiones asignadas, acepta nuevos desafíos y completa tareas."
          />
          
          {/* Mini stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border-2 border-yellow-200 p-3 sm:p-4">
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs sm:text-sm text-muted">Pendientes</p>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border-2 border-blue-200 p-3 sm:p-4">
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{activeCount}</p>
              <p className="text-xs sm:text-sm text-muted">Activas</p>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border-2 border-green-200 p-3 sm:p-4">
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{completedCount}</p>
              <p className="text-xs sm:text-sm text-muted">Completadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {STATUS_FILTERS.map((filter) => {
          const Icon = filter.icon;
          const isActive = statusFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => {
                const input = document.querySelector('[name="status"]');
                if (input) {
                  input.value = filter.value;
                  const event = new Event('input', { bubbles: true });
                  input.dispatchEvent(event);
                }
              }}
              className={`
                flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all
                ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-slate-200 text-ink hover:border-primary hover:bg-primary/5'
                }
                button-hover
              `}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {filter.label}
            </button>
          );
        })}
        <input type="hidden" {...register('status')} />
      </div>

      {/* Lista de asignaciones */}
      {assignments.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8">
          <div className="text-center">
            <ClockIcon className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-ink">
              {statusFilter ? 'No hay asignaciones con este filtro' : 'No tienes asignaciones aún'}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {!statusFilter &&
                'Las organizaciones te asignarán misiones basadas en tus habilidades y disponibilidad.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onAccept={handleAccept}
              onReject={handleReject}
              onComplete={handleOpenComplete}
            />
          ))}
        </div>
      )}

      {/* Modal de completar */}
      <CompleteAssignmentModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onCompleted={handleCompleted}
        api={api}
        onBadgeEarned={(badge) => {
          setEarnedBadge(badge);
          setIsBadgeModalOpen(true);
        }}
      />

      {/* Modal de Badge Ganado */}
      <BadgeEarnedModal
        isOpen={isBadgeModalOpen}
        onClose={() => {
          setIsBadgeModalOpen(false);
          setEarnedBadge(null);
          // Redirigir a badges
          window.location.href = '/dashboard/badges';
        }}
        badge={earnedBadge}
      />
    </div>
  );
};

export default AssignmentsPage;

