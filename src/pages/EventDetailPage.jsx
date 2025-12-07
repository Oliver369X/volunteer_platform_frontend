import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { authFetch } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const data = await api.getEventById(eventId);
      setEvent(data);
    } catch (err) {
      setError(err.message || 'Error al cargar evento');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await authFetch(`/events/${eventId}/publish`, { method: 'POST' });
      fetchEventDetails();
      alert('Evento publicado exitosamente');
    } catch (err) {
      setError(err.message || 'Error al publicar evento');
    }
  };

  const handleViewTracking = () => {
    navigate(`/dashboard/events/${eventId}/tracking`);
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return <div>Evento no encontrado</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/dashboard/events')}
        className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
      >
        ← Volver a Eventos
      </button>

      <PageHeader title={event.title} subtitle={event.description} />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Información del Evento */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Detalles del Evento</h3>
          
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <p className="text-lg font-semibold">{event.status}</p>
            </div>

            {event.locationName && (
              <div>
                <label className="text-sm font-medium text-gray-600">Ubicación</label>
                <p>📍 {event.locationName}</p>
                {event.latitude && (
                  <p className="text-sm text-gray-500">
                    Coordenadas: {parseFloat(event.latitude).toFixed(4)}, {parseFloat(event.longitude).toFixed(4)}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha Inicio</label>
                <p>{event.startDate && new Date(event.startDate).toLocaleString('es-ES')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha Fin</label>
                <p>{event.endDate && new Date(event.endDate).toLocaleString('es-ES')}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Coordinadores</label>
              <div className="flex gap-2 mt-2">
                {event.coordinators?.map((coord) => (
                  <div key={coord.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {coord.user.fullName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Acciones Rápidas</h3>
          
          <div className="space-y-2">
            {event.status === 'DRAFT' && (
              <button
                onClick={handlePublish}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✅ Publicar Evento
              </button>
            )}

            {(event.status === 'PUBLISHED' || event.status === 'IN_PROGRESS') && (
              <>
                <button
                  onClick={handleViewTracking}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  🗺️ Ver Mapa Tracking
                </button>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  + Agregar Tarea
                </button>
              </>
            )}

            <button
              onClick={() => navigate('/dashboard/events')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Volver a Eventos
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Tareas del Evento */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">Tareas del Evento ({event.tasks?.length || 0})</h3>
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            + Agregar Tarea
          </button>
        </div>
        
        <div className="divide-y">
          {event.tasks?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay tareas creadas para este evento
            </div>
          ) : (
            event.tasks?.map((task) => (
              <div key={task.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                      <span>👥 {task._count?.assignments || 0} asignados</span>
                      <span>📋 {task.status}</span>
                      <span>⚡ {task.urgency}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/tasks/${task.id}`)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                  >
                    Ver
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;

