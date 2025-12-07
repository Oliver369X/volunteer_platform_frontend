import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

const BroadcastPage = () => {
  const { user, authFetch } = useAuth();
  const api = useApi();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      title: '',
      message: '',
      channels: ['EMAIL'],
      eventId: '',
    },
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const orgId = user?.organizations?.[0]?.id;
      if (!orgId) {
        setError('No tienes una organización asociada');
        return;
      }
      const data = await api.listEvents(orgId);
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError(null);
      setSuccess(null);

      await authFetch('/broadcasts', {
        method: 'POST',
        body: {
          eventId: data.eventId || null,
          title: data.title,
          message: data.message,
          channels: data.channels,
        },
      });

      setSuccess('Comunicado enviado exitosamente');
      reset();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al enviar comunicado');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader
        title="Difusión de Comunicados"
        subtitle="Envía mensajes masivos a voluntarios"
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MegaphoneIcon className="h-6 w-6 text-blue-600" />
              Nuevo Comunicado
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Evento (Opcional)</label>
                <select
                  {...register('eventId')}
                  className="w-full px-3 py-2 border rounded-lg"
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">Todos los voluntarios</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Si seleccionas un evento, el mensaje se enviará solo a los voluntarios de ese evento
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Asunto *</label>
                <input
                  type="text"
                  {...register('title', { required: 'El asunto es requerido' })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Cambio de horario importante"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mensaje *</label>
                <textarea
                  {...register('message', { required: 'El mensaje es requerido' })}
                  rows="6"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Escribe tu mensaje aquí..."
                />
                {errors.message && (
                  <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Canales de Envío *</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value="EMAIL"
                      {...register('channels', { required: 'Selecciona al menos un canal' })}
                      className="rounded"
                    />
                    <span>📧 Correo Electrónico</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value="PUSH"
                      {...register('channels')}
                      className="rounded"
                    />
                    <span>🔔 Notificación Push</span>
                  </label>
                </div>
                {errors.channels && (
                  <p className="text-sm text-red-600 mt-1">{errors.channels.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Comunicado'}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Información</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-900 mb-1">📧 Correo Electrónico</p>
              <p>Se envía un email a todos los destinatarios seleccionados</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">🔔 Notificación Push</p>
              <p>Notificación en tiempo real en la aplicación móvil</p>
            </div>
            <div className="pt-3 border-t">
              <p className="font-medium text-gray-900 mb-1">💡 Consejo</p>
              <p>Usa comunicados para informar cambios urgentes, recordatorios o actualizaciones importantes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroadcastPage;

