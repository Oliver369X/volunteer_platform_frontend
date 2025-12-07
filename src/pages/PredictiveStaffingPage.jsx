import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const PredictiveStaffingPage = () => {
  const { user, authFetch } = useAuth();
  const api = useApi();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      eventType: '',
      expectedAttendees: '',
      duration: '',
      complexity: 'MEDIUM',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setPrediction(null);

      const response = await authFetch('/matching/predict-staffing', {
        method: 'POST',
        body: {
          eventType: data.eventType,
          expectedAttendees: parseInt(data.expectedAttendees),
          duration: parseInt(data.duration),
          complexity: data.complexity,
        },
      });

      // El backend devuelve { status: 'success', data: {...} }
      setPrediction(response.data || response);
    } catch (err) {
      setError(err.message || 'Error al calcular predicción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Cálculo Predictivo de Personal"
        subtitle="IA sugiere la cantidad óptima de voluntarios necesarios"
        icon={SparklesIcon}
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            Parámetros del Evento
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Evento *</label>
              <select
                {...register('eventType', { required: 'El tipo de evento es requerido' })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Selecciona un tipo</option>
                <option value="SOCIAL">Social</option>
                <option value="ENVIRONMENTAL">Ambiental</option>
                <option value="EDUCATIONAL">Educativo</option>
                <option value="HEALTH">Salud</option>
                <option value="EMERGENCY">Emergencia</option>
                <option value="LOGISTICS">Logística</option>
              </select>
              {errors.eventType && (
                <p className="text-sm text-red-600 mt-1">{errors.eventType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Asistentes Esperados *</label>
              <input
                type="number"
                {...register('expectedAttendees', {
                  required: 'El número de asistentes es requerido',
                  min: { value: 1, message: 'Mínimo 1 asistente' },
                })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ej: 500"
              />
              {errors.expectedAttendees && (
                <p className="text-sm text-red-600 mt-1">{errors.expectedAttendees.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Duración (horas) *</label>
              <input
                type="number"
                {...register('duration', {
                  required: 'La duración es requerida',
                  min: { value: 1, message: 'Mínimo 1 hora' },
                })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Ej: 4"
              />
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Complejidad</label>
              <select
                {...register('complexity')}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Calculando...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Calcular con IA
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resultado de la Predicción */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
            Recomendación de la IA
          </h3>

          {prediction ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Voluntarios Recomendados</p>
                  <p className="text-5xl font-bold text-purple-600 mb-2">
                    {prediction.recommendedVolunteers}
                  </p>
                  <p className="text-xs text-gray-500">
                    Rango: {prediction.minVolunteers} - {prediction.maxVolunteers}
                  </p>
                </div>
              </div>

              {prediction.breakdown && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Distribución por Rol:</p>
                  {Object.entries(prediction.breakdown).map(([role, count]) => (
                    <div key={role} className="flex justify-between text-sm">
                      <span className="text-gray-600">{role}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {prediction.reasoning && (
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs font-medium text-blue-900 mb-1">Razonamiento de la IA:</p>
                  <p className="text-xs text-blue-800">{prediction.reasoning}</p>
                </div>
              )}

              <button
                onClick={() => {
                  // Aplicar la sugerencia creando tareas automáticamente
                  alert('Funcionalidad de aplicación automática próximamente');
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Aplicar Sugerencia
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <SparklesIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Completa el formulario para obtener una predicción</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictiveStaffingPage;

