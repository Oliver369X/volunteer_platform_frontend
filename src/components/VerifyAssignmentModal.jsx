'use strict';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, CheckCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import ErrorAlert from './ErrorAlert.jsx';

const VerifyAssignmentModal = ({ isOpen, onClose, assignment, onVerified, api }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [badges, setBadges] = useState([]);
  const [selectedBadgeCodes, setSelectedBadgeCodes] = useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      rating: 5,
      pointsAwarded: 100,
      feedback: '',
    },
  });

  const rating = watch('rating');
  const pointsAwarded = watch('pointsAwarded');

  // Load badges when modal opens
  useEffect(() => {
    if (isOpen && assignment?.task?.metadata) {
      const taskMetadata = typeof assignment.task.metadata === 'string' 
        ? JSON.parse(assignment.task.metadata) 
        : assignment.task.metadata;
      if (taskMetadata.badgeCodes && Array.isArray(taskMetadata.badgeCodes)) {
        setSelectedBadgeCodes(taskMetadata.badgeCodes);
      }
      loadBadges();
    }
  }, [isOpen, assignment]);

  const loadBadges = async () => {
    try {
      const response = await api.listBadges();
      const badgesList = Array.isArray(response) ? response : response?.data || [];
      setBadges(badgesList);
    } catch (err) {
      console.error('Error loading badges:', err);
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
        rating: parseInt(data.rating, 10),
        pointsAwarded: parseInt(data.pointsAwarded, 10),
        feedback: data.feedback || '',
        badgeCodes: selectedBadgeCodes.length > 0 ? selectedBadgeCodes : undefined,
      };

      await api.completeAssignment(assignment.id, payload);
      reset();
      setSelectedBadgeCodes([]);
      onVerified();
    } catch (err) {
      setError(err.message || 'Error al verificar la asignación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-slate-200 bg-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-slate-200 bg-gradient-to-r from-primary/10 to-emerald/10 p-6">
          <div>
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
              Verificar y Calificar Asignación
            </h2>
            <p className="text-sm text-muted mt-1">
              {assignment.task?.title}
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
          {error && <ErrorAlert message={error} />}

          {/* Assignment Info */}
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-ink mb-3">📋 Información de la Asignación</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Voluntario:</span> {assignment.volunteer?.fullName || 'N/A'}</p>
              <p><span className="font-semibold">Email:</span> {assignment.volunteer?.email || 'N/A'}</p>
              {assignment.completedAt && (
                <p><span className="font-semibold">Completada:</span> {new Date(assignment.completedAt).toLocaleString()}</p>
              )}
              {assignment.verificationNotes && (
                <div>
                  <p className="font-semibold mb-1">Notas del voluntario:</p>
                  <p className="text-muted bg-white p-2 rounded">{assignment.verificationNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Photo */}
          {assignment.evidenceUrl && (
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-ink mb-3">📷 Evidencia Fotográfica</h3>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={assignment.evidenceUrl}
                  alt="Evidencia de completitud"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Calificación (1-5 estrellas) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('[name="rating"]');
                      if (input) {
                        input.value = star;
                        const event = new Event('input', { bubbles: true });
                        input.dispatchEvent(event);
                      }
                    }}
                    className={`
                      transition-all
                      ${rating >= star ? 'text-yellow-500 scale-110' : 'text-slate-300'}
                    `}
                  >
                    <StarIcon className="h-8 w-8 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold text-ink">
                  {rating} / 5
                </span>
              </div>
              <input type="hidden" {...register('rating', { required: true, min: 1, max: 5 })} />
              {errors.rating && (
                <p className="text-sm text-red-600 mt-1">{errors.rating.message}</p>
              )}
            </div>

            {/* Points */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Puntos a Otorgar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                step="10"
                {...register('pointsAwarded', { required: true, min: 0, max: 1000 })}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.pointsAwarded && (
                <p className="text-sm text-red-600 mt-1">{errors.pointsAwarded.message}</p>
              )}
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Comentarios y Feedback
              </label>
              <textarea
                {...register('feedback')}
                rows={4}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Escribe tus comentarios sobre el trabajo realizado..."
              />
            </div>

            {/* Badge Selection */}
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
              <label className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-ink">
                  🏆 Badges a Otorgar (Opcional)
                </span>
              </label>
              <p className="text-xs text-muted mb-3">
                Los badges asignados a esta tarea se otorgarán automáticamente. También puedes seleccionar badges adicionales.
              </p>
              {badges.length === 0 ? (
                <p className="text-sm text-muted">Cargando badges...</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto">
                  {badges.map((badge) => {
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
                            <span className="text-xs">🏆</span>
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
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-ink transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"></span>
                    Verificando...
                  </>
                ) : (
                  <>✅ Verificar y Otorgar Recompensas</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyAssignmentModal;

