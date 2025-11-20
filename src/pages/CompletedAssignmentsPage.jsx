'use strict';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import { CheckCircleIcon, ClockIcon, PhotoIcon, UserIcon } from '@heroicons/react/24/outline';
import { formatDateTime } from '../lib/formatters.js';
import VerifyAssignmentModal from '../components/VerifyAssignmentModal.jsx';

const STATUS_FILTERS = [
  { value: '', label: 'Todas', icon: null },
  { value: 'COMPLETED', label: 'Pendientes de Verificar', icon: ClockIcon },
  { value: 'VERIFIED', label: 'Verificadas', icon: CheckCircleIcon },
];

const CompletedAssignmentsPage = () => {
  const api = useApi();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const { register, watch, setValue } = useForm({
    defaultValues: { status: '' },
  });
  const statusFilter = watch('status');

  const loadAssignments = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getOrganizationCompletedAssignments(filters);
      const assignmentsList = Array.isArray(response) 
        ? response 
        : response?.data || [];
      setAssignments(assignmentsList);
    } catch (fetchError) {
      console.error('Error loading assignments:', fetchError);
      setError(fetchError.message || 'Error al cargar asignaciones');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ORGANIZATION' || user?.role === 'ADMIN') {
      loadAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    if ((user?.role === 'ORGANIZATION' || user?.role === 'ADMIN') && statusFilter !== undefined) {
      const filters = statusFilter && statusFilter.trim() !== '' 
        ? { status: statusFilter } 
        : {};
      loadAssignments(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, user?.role]);

  const handleVerified = () => {
    setIsVerifyModalOpen(false);
    setSelectedAssignment(null);
    const filters = statusFilter && statusFilter.trim() !== '' 
      ? { status: statusFilter } 
      : {};
    loadAssignments(filters);
  };

  if (user?.role !== 'ORGANIZATION' && user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-ink">Solo para organizaciones</h3>
          <p className="mt-2 text-sm text-muted">
            Esta sección es solo para organizaciones y administradores.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner label="Cargando asignaciones completadas..." fullPage={false} />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  const pendingCount = assignments.filter((a) => a.status === 'COMPLETED').length;
  const verifiedCount = assignments.filter((a) => a.status === 'VERIFIED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="relative">
          <PageHeader
            title="✅ Asignaciones Completadas"
            description="Revisa y verifica las tareas completadas por los voluntarios, incluyendo evidencia fotográfica."
          />
          
          {/* Mini stats */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border-2 border-yellow-200 p-3 sm:p-4">
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs sm:text-sm text-muted">Pendientes de Verificar</p>
            </div>
            <div className="rounded-xl bg-white/80 backdrop-blur-sm border-2 border-green-200 p-3 sm:p-4">
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{verifiedCount}</p>
              <p className="text-xs sm:text-sm text-muted">Verificadas</p>
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
              type="button"
              onClick={() => {
                setValue('status', filter.value);
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
            <CheckCircleIcon className="mx-auto h-16 w-16 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-ink">
              {statusFilter ? 'No hay asignaciones con este filtro' : 'No hay asignaciones completadas aún'}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {!statusFilter &&
                'Los voluntarios completarán tareas y aparecerán aquí para verificación.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => {
            if (!assignment || !assignment.id) {
              return null;
            }
            const isCompleted = assignment.status === 'COMPLETED';
            const isVerified = assignment.status === 'VERIFIED';
            
            return (
              <div
                key={assignment.id}
                className={`
                  group relative flex flex-col gap-3 rounded-2xl border-2 p-4 shadow-lg 
                  transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]
                  ${
                    isVerified
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100'
                      : 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100'
                  }
                  animate-slide-up
                `}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`
                      inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold
                      ${
                        isVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    `}
                  >
                    {isVerified ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <ClockIcon className="h-4 w-4" />
                    )}
                    {isVerified ? 'Verificada' : 'Pendiente de Verificar'}
                  </span>
                </div>

                {/* Task info */}
                <div>
                  <h3 className="text-lg font-bold text-ink mb-1 line-clamp-2">
                    {assignment.task?.title || 'Misión sin título'}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2">
                    {assignment.task?.description || 'Sin descripción'}
                  </p>
                </div>

                {/* Volunteer info */}
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-ink">
                    {assignment.volunteer?.fullName || 'Voluntario'}
                  </span>
                </div>

                {/* Evidence photo */}
                {assignment.evidenceUrl && (
                  <div className="rounded-xl border-2 border-slate-200 bg-white p-2">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={assignment.evidenceUrl}
                        alt="Evidencia de completitud"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="hidden h-full w-full items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <PhotoIcon className="h-12 w-12 text-slate-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted text-center">
                      📷 Evidencia subida
                    </p>
                  </div>
                )}

                {/* Notes */}
                {assignment.verificationNotes && (
                  <div className="rounded-lg bg-white/80 p-2 text-xs text-muted">
                    <p className="font-semibold text-ink mb-1">Notas:</p>
                    <p className="line-clamp-3">{assignment.verificationNotes}</p>
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-1 text-xs text-muted">
                  {assignment.completedAt && (
                    <p>✅ Completada: {formatDateTime(assignment.completedAt)}</p>
                  )}
                  {assignment.assignedAt && (
                    <p>📅 Asignada: {formatDateTime(assignment.assignedAt)}</p>
                  )}
                </div>

                {/* Organization */}
                {assignment.task?.organization?.name && (
                  <div className="text-xs font-semibold text-primary">
                    🏢 {assignment.task.organization.name}
                  </div>
                )}

                {/* Actions */}
                {isCompleted && (
                  <button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setIsVerifyModalOpen(true);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 button-hover mt-2"
                  >
                    ✅ Verificar y Calificar
                  </button>
                )}

                {isVerified && assignment.rating && (
                  <div className="rounded-xl bg-white/80 p-3 text-center">
                    <p className="text-2xl mb-1">{'⭐'.repeat(assignment.rating)}</p>
                    <p className="text-xs text-muted">Calificación otorgada</p>
                  </div>
                )}

                {/* Efecto de brillo */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de verificación */}
      <VerifyAssignmentModal
        isOpen={isVerifyModalOpen}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onVerified={handleVerified}
        api={api}
      />
    </div>
  );
};

export default CompletedAssignmentsPage;

