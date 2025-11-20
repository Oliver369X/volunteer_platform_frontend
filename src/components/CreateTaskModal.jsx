'use strict';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import InputField from './InputField.jsx';
import ErrorAlert from './ErrorAlert.jsx';
import useApi from '../hooks/useApi.js';

const schema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(180),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.string().min(3, 'La categoría es requerida'),
  skillsRequired: z.string().min(3, 'Especifica al menos una habilidad'),
  locationName: z.string().min(3, 'La ubicación es requerida'),
  volunteersNeeded: z.number().min(1, 'Se necesita al menos 1 voluntario').max(100),
  startAt: z.string().min(1, 'La fecha de inicio es requerida'),
  endAt: z.string().min(1, 'La fecha de fin es requerida'),
});

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated, api, organizationId }) => {
  const [serverError, setServerError] = useState(null);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [selectedBadgeCodes, setSelectedBadgeCodes] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      urgency: 'MEDIUM',
      category: '',
      skillsRequired: '',
      locationName: '',
      volunteersNeeded: 1,
      startAt: '',
      endAt: '',
    },
  });

  // Load badges when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBadges();
    }
  }, [isOpen]);

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

  const onSubmit = async (values) => {
    try {
      setServerError(null);
      
      if (!organizationId) {
        setServerError('No se pudo identificar tu organización');
        return;
      }

      // Procesar skills como array
      const payload = {
        organizationId,
        ...values,
        skillsRequired: values.skillsRequired
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        volunteersNeeded: parseInt(values.volunteersNeeded, 10),
        startAt: new Date(values.startAt).toISOString(),
        endAt: new Date(values.endAt).toISOString(),
        badgeCodes: selectedBadgeCodes.length > 0 ? selectedBadgeCodes : undefined,
      };

      const result = await api.createTask(payload);
      reset();
      setSelectedBadgeCodes([]);
      onTaskCreated(result);
      onClose();
    } catch (error) {
      setServerError(error.message ?? 'No se pudo crear la tarea');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-ink">Nueva Misión</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-slate-100"
            type="button"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {serverError ? <ErrorAlert message={serverError} /> : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <InputField
            label="Título de la misión"
            required
            placeholder="Ej: Distribución de alimentos en zona inundada"
            {...register('title')}
            error={errors.title?.message}
          />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">
              Descripción<span className="ml-1 text-primary">*</span>
            </span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Describe detalladamente la misión, objetivos y consideraciones importantes"
              {...register('description')}
            />
            {errors.description?.message ? (
              <span className="text-xs text-red-600">{errors.description.message}</span>
            ) : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">
                Urgencia<span className="ml-1 text-primary">*</span>
              </span>
              <select
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register('urgency')}
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
              {errors.urgency?.message ? (
                <span className="text-xs text-red-600">{errors.urgency.message}</span>
              ) : null}
            </label>

            <InputField
              label="Categoría"
              required
              placeholder="Ej: Logística, Salud, Construcción"
              {...register('category')}
              error={errors.category?.message}
            />
          </div>

          <InputField
            label="Habilidades requeridas (separadas por coma)"
            required
            placeholder="primeros-auxilios, logistica, coordinacion"
            {...register('skillsRequired')}
            error={errors.skillsRequired?.message}
          />

          <InputField
            label="Ubicación"
            required
            placeholder="Santa Cruz de la Sierra"
            {...register('locationName')}
            error={errors.locationName?.message}
          />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">
              Voluntarios necesarios<span className="ml-1 text-primary">*</span>
            </span>
            <input
              type="number"
              min="1"
              max="100"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register('volunteersNeeded', { valueAsNumber: true })}
            />
            {errors.volunteersNeeded?.message ? (
              <span className="text-xs text-red-600">{errors.volunteersNeeded.message}</span>
            ) : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">
                Fecha y hora de inicio<span className="ml-1 text-primary">*</span>
              </span>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register('startAt')}
              />
              {errors.startAt?.message ? (
                <span className="text-xs text-red-600">{errors.startAt.message}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">
                Fecha y hora de fin<span className="ml-1 text-primary">*</span>
              </span>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register('endAt')}
              />
              {errors.endAt?.message ? (
                <span className="text-xs text-red-600">{errors.endAt.message}</span>
              ) : null}
            </label>
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
            >
              {isSubmitting ? 'Creando...' : 'Crear Misión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;

