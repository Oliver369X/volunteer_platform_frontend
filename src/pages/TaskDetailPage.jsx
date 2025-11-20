'use strict';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import EditTaskModal from '../components/EditTaskModal.jsx';
import { formatDateTime } from '../lib/formatters.js';
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  FireIcon,
  CheckCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', emoji: '⏳' },
  ASSIGNED: { label: 'Asignada', color: 'bg-blue-100 text-blue-700', emoji: '📋' },
  IN_PROGRESS: { label: 'En Progreso', color: 'bg-indigo-100 text-indigo-700', emoji: '🔄' },
  COMPLETED: { label: 'Completada', color: 'bg-green-100 text-green-700', emoji: '✅' },
  VERIFIED: { label: 'Verificada', color: 'bg-emerald-100 text-emerald-700', emoji: '🎉' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-700', emoji: '❌' },
};

const URGENCY_CONFIG = {
  LOW: { label: 'Baja', color: 'text-green-600', emoji: '🟢' },
  MEDIUM: { label: 'Media', color: 'text-yellow-600', emoji: '🟡' },
  HIGH: { label: 'Alta', color: 'text-orange-600', emoji: '🟠' },
  CRITICAL: { label: 'Crítica', color: 'text-red-600', emoji: '🔴' },
};

const ASSIGNMENT_STATUS_CONFIG = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  ACCEPTED: { label: 'Aceptada', color: 'bg-blue-100 text-blue-700' },
  REJECTED: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  IN_PROGRESS: { label: 'En Progreso', color: 'bg-indigo-100 text-indigo-700' },
  COMPLETED: { label: 'Completada', color: 'bg-green-100 text-green-700' },
  VERIFIED: { label: 'Verificada', color: 'bg-emerald-100 text-emerald-700' },
};

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTaskDetail(taskId);
      setTask(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Cargando detalles de la misión..." fullPage={false} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/dashboard/tasks')}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a Tareas
        </button>
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (!task) {
    return <ErrorAlert message="Tarea no encontrada" />;
  }

  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.PENDING;
  const urgencyConfig = URGENCY_CONFIG[task.urgency] || URGENCY_CONFIG.MEDIUM;
  const canEdit = user?.role === 'ORGANIZATION' && task.status !== 'CANCELLED';
  const assignments = task.assignments || [];
  const assignedCount = assignments.filter((a) => a.status !== 'REJECTED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navegación */}
      <button
        onClick={() => navigate('/dashboard/tasks')}
        className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-all"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a Tareas
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-primary/10 via-white to-emerald/10 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${statusConfig.color}`}>
                <span>{statusConfig.emoji}</span>
                {statusConfig.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold bg-white border-2 ${urgencyConfig.color}`}>
                <span>{urgencyConfig.emoji}</span>
                {urgencyConfig.label}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
              {task.title}
            </h1>
            <p className="text-muted">
              {task.description || 'Sin descripción'}
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-white border-2 border-primary px-4 py-2.5 text-sm font-bold text-primary shadow-lg transition-all hover:bg-primary hover:text-white button-hover"
            >
              <PencilIcon className="h-5 w-5" />
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Detalles Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{assignedCount}/{task.volunteersNeeded}</p>
              <p className="text-xs text-muted">Voluntarios</p>
            </div>
          </div>
        </div>

        {task.locationName && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-3">
                <MapPinIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink line-clamp-2">{task.locationName}</p>
                <p className="text-xs text-muted">Ubicación</p>
              </div>
            </div>
          </div>
        )}

        {task.startAt && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-3">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{formatDateTime(task.startAt)}</p>
                <p className="text-xs text-muted">Inicio</p>
              </div>
            </div>
          </div>
        )}

        {task.organization && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-3">
                <BuildingOfficeIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink line-clamp-2">{task.organization.name}</p>
                <p className="text-xs text-muted">Organización</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Habilidades Requeridas */}
      {task.skillsRequired && task.skillsRequired.length > 0 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-lg font-bold text-ink mb-3 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-primary" />
            Habilidades Requeridas
          </h2>
          <div className="flex flex-wrap gap-2">
            {task.skillsRequired.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary border-2 border-primary/20"
              >
                ✨ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Voluntarios Asignados */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <UserGroupIcon className="h-6 w-6 text-primary" />
          Voluntarios Asignados ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <UserGroupIcon className="h-12 w-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm">Aún no hay voluntarios asignados a esta misión</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const assignmentStatusConfig =
                ASSIGNMENT_STATUS_CONFIG[assignment.status] ||
                ASSIGNMENT_STATUS_CONFIG.PENDING;
              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between rounded-xl border-2 border-slate-200 bg-slate-50 p-4 transition-all hover:border-primary hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-sm shadow-lg">
                      {assignment.volunteer?.fullName?.charAt(0)?.toUpperCase() || 'V'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {assignment.volunteer?.fullName || 'Voluntario'}
                      </p>
                      <p className="text-xs text-muted">
                        {assignment.volunteer?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${assignmentStatusConfig.color}`}
                    >
                      {assignmentStatusConfig.label}
                    </span>
                    {assignment.assignedAt && (
                      <p className="text-xs text-muted mt-1">
                        {formatDateTime(assignment.assignedAt)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Información Adicional */}
      <div className="grid gap-4 sm:grid-cols-2">
        {task.category && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
            <h3 className="text-sm font-bold text-ink mb-2">Categoría</h3>
            <p className="text-sm text-muted">{task.category}</p>
          </div>
        )}
        {task.createdAt && (
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-lg">
            <h3 className="text-sm font-bold text-ink mb-2">Creada el</h3>
            <p className="text-sm text-muted">{formatDateTime(task.createdAt)}</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onTaskUpdated={(updatedTask) => {
          setTask(updatedTask);
          setIsEditModalOpen(false);
        }}
        api={api}
      />
    </div>
  );
};

export default TaskDetailPage;

