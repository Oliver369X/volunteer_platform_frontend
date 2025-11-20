'use strict';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import FileUpload from './FileUpload.jsx';

const CompleteAssignmentModal = ({ isOpen, onClose, assignment, onCompleted, api, onBadgeEarned }) => {
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [completedData, setCompletedData] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      notes: '',
      pointsAwarded: 100,
      rating: 5,
      feedback: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Usar el endpoint correcto: markAsCompleted (desde voluntario)
      // El endpoint de complete es para organizaciones (verificar)
      
      // Crear FormData si hay evidencia
      if (evidenceFile) {
        const formData = new FormData();
        formData.append('evidence', evidenceFile);
        formData.append('notes', data.notes || 'Tarea completada');

        // Llamar al endpoint con FormData
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/gamification/assignments/${assignment.id}/mark-completed`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('vip.auth.tokens') ? JSON.parse(localStorage.getItem('vip.auth.tokens')).accessToken : ''}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al subir evidencia');
        }
      } else {
        // Sin evidencia, solo marcar como completada
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/gamification/assignments/${assignment.id}/mark-completed`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('vip.auth.tokens') ? JSON.parse(localStorage.getItem('vip.auth.tokens')).accessToken : ''}`,
            },
            body: JSON.stringify({ notes: data.notes || 'Tarea completada' }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al completar');
        }

        const result = await response.json();
        setCompletedData(result.data);
      }

      // Mostrar mensaje de éxito
      alert('✅ ¡Tarea marcada como completada!\n\nLa organización recibirá una notificación para verificar tu trabajo y asignar la calificación correspondiente.');
      
      reset();
      setEvidenceFile(null);
      onCompleted();
      
      // TODO: Si hay badges ganados, mostrarlos
      // if (completedData?.badgesEarned?.length > 0) {
      //   onBadgeEarned?.(completedData.badgesEarned[0]);
      // }
    } catch (err) {
      setError(err.message || 'Error al completar la asignación');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-slate-200 bg-white shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-slate-200 bg-gradient-to-r from-primary/10 to-emerald/10 p-6">
          <div>
            <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
              Completar Misión
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
          {error && (
            <div className="rounded-xl border-2 border-red-400 bg-red-50 p-4 text-sm text-red-700 animate-slide-down">
              ⚠️ {error}
            </div>
          )}

          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-ink mb-2">📋 Detalles de la Misión</h3>
            <p className="text-sm text-muted">
              {assignment.task?.description || 'Sin descripción'}
            </p>
            {assignment.task?.locationName && (
              <p className="text-xs text-muted mt-2">
                📍 {assignment.task.locationName}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Notas de la misión */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Notas y Comentarios
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                className="w-full rounded-xl border-2 border-slate-200 p-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Describe cómo completaste la misión, qué lograste, etc..."
              />
              {errors.notes && (
                <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
              )}
            </div>

            {/* Evidencia (foto/documento) */}
            <FileUpload
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              value={evidenceFile}
              onChange={setEvidenceFile}
              label="Evidencia de Completitud (Opcional)"
              preview={true}
            />

            {/* Info: Calificación la da la organización */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                ℹ️ ¿Cómo funciona?
              </p>
              <p className="text-xs text-blue-800">
                Al marcar como completada, la organización recibirá una notificación para verificar 
                tu trabajo. Ellos asignarán la calificación y puntos correspondientes.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
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
                className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"></span>
                    Enviando...
                  </>
                ) : (
                  <>✅ Marcar como Completada</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteAssignmentModal;

