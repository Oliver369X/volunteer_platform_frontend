'use strict';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import InputField from './InputField.jsx';
import ErrorAlert from './ErrorAlert.jsx';

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
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
      };

      const result = await api.createTask(payload);
      reset();
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

