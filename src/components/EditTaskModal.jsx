'use strict';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, PencilIcon, SparklesIcon } from '@heroicons/react/24/outline';
import useApi from '../hooks/useApi.js';

const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdated, api }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [selectedBadgeCodes, setSelectedBadgeCodes] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'PENDING',
      urgency: task?.urgency || 'MEDIUM',
      category: task?.category || '',
      locationName: task?.locationName || '',
      volunteersNeeded: task?.volunteersNeeded || 1,
      skillsRequired: task?.skillsRequired?.join(', ') || '',
    },
  });

  // Load badges and set selected badges from task metadata
  useEffect(() => {
    if (isOpen) {
      loadBadges();
      // Extract badgeCodes from task metadata
      if (task?.metadata) {
        const taskMetadata = typeof task.metadata === 'string' 
          ? JSON.parse(task.metadata) 
          : task.metadata;
        if (taskMetadata.badgeCodes && Array.isArray(taskMetadata.badgeCodes)) {
          setSelectedBadgeCodes(taskMetadata.badgeCodes);
        }
      }
    }
  }, [isOpen, task]);

  const loadBadges = async () => {
    try {
      setLoadingBadges(true);
      const response = await api.listBadges();
      const badgesList = Array.isArray(response) ? response : response?.data || [];
      setAvailableBadges(badgesList);
    } catch (err) {
      console.error('Error loading badges:', err);
    } finally {
      setLoadingBadges(false);
    }
  };

  const toggleBadge = (badgeCode) => {
    setSelectedBadgeCodes((prev) =>
      prev.includes(badgeCode)
        ? prev.filter((code) => code !== badgeCode)
        : [...prev, badgeCode]
    );
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        ...data,
        volunteersNeeded: Number(data.volunteersNeeded),
        skillsRequired: data.skillsRequired
          ? data.skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        badgeCodes: selectedBadgeCodes.length > 0 ? selectedBadgeCodes : [],
      };

      const updated = await api.updateTask(task.id, payload);
      onTaskUpdated(updated);
    } catch (err) {
      setError(err.message || 'Error al actualizar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta tarea? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.updateTaskStatus(task.id, 'CANCELLED');
      onTaskUpdated({ ...task, status: 'CANCELLED' });
    } catch (err) {
      setError(err.message || 'Error al cancelar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-slate-200 bg-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-slate-200 bg-gradient-to-r from-primary/10 to-emerald/10 p-6">
          <div>
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <PencilIcon className="h-7 w-7 text-primary" />
              Editar Misión
            </h2>
            <p className="text-sm text-muted mt-1">
              Actualiza los detalles de la misión
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-slate-200 bg-white p-2 text-muted transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4 text-sm text-red-700 animate-slide-down">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Título */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('title', { required: 'El título es requerido' })}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Ej: Distribución de alimentos en zona afectada"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Descripción
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Describe los detalles de la misión..."
              />
            </div>

            {/* Grid de campos */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Estado
                </label>
                <select
                  {...register('status')}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="ASSIGNED">Asignada</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="VERIFIED">Verificada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>

              {/* Urgencia */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Urgencia
                </label>
                <select
                  {...register('urgency')}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="CRITICAL">Crítica</option>
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  {...register('category')}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ej: Salud, Educación"
                />
              </div>

              {/* Voluntarios necesarios */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Voluntarios Necesarios
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('volunteersNeeded')}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Ubicación
              </label>
              <input
                type="text"
                {...register('locationName')}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ej: Santa Cruz de la Sierra, Bolivia"
              />
            </div>

            {/* Habilidades */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Habilidades Requeridas
              </label>
              <input
                type="text"
                {...register('skillsRequired')}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Separadas por comas: primeros auxilios, logística, cocina"
              />
              <p className="text-xs text-muted mt-1">
                Separa las habilidades con comas
              </p>
            </div>

            {/* Badge Selection */}
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
              <label className="flex items-center gap-2 mb-3">
                <SparklesIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-ink">
                  Badges a Otorgar (Opcional)
                </span>
              </label>
              <p className="text-xs text-muted mb-3">
                Selecciona los badges que los voluntarios recibirán al completar esta tarea
              </p>
              {loadingBadges ? (
                <p className="text-sm text-muted">Cargando badges...</p>
              ) : availableBadges.length === 0 ? (
                <p className="text-sm text-muted">
                  No hay badges disponibles. Crea badges primero en la página de Badges NFT.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto">
                  {availableBadges.map((badge) => {
                    const isSelected = selectedBadgeCodes.includes(badge.code);
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => toggleBadge(badge.code)}
                        className={`flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-slate-200 bg-white hover:border-primary/50'
                        }`}
                      >
                        {badge.iconUrl ? (
                          <img
                            src={badge.iconUrl}
                            alt={badge.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20">
                            <SparklesIcon className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-ink truncate">{badge.name}</p>
                          <p className="text-[10px] text-muted truncate">
                            {badge.level} • {badge.code}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="rounded-full bg-primary p-1">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedBadgeCodes.length > 0 && (
                <p className="mt-2 text-xs text-primary font-semibold">
                  {selectedBadgeCodes.length} badge{selectedBadgeCodes.length !== 1 ? 's' : ''} seleccionado{selectedBadgeCodes.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting || task.status === 'CANCELLED'}
                className="order-last sm:order-first rounded-xl border-2 border-red-400 bg-white px-6 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
              >
                🗑️ Cancelar Misión
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-ink transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"></span>
                    Guardando...
                  </>
                ) : (
                  <>💾 Guardar Cambios</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;

