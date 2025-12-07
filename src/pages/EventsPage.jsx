import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { useAuth } from '../hooks/useAuth';
import useApi from '../hooks/useApi';

const EventsPage = () => {
  const { user, authFetch } = useAuth();
  const api = useApi();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationName: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const orgId = user?.organizations?.[0]?.id;
      if (!orgId) {
        setError('No tienes una organización asociada');
        return;
      }

      // Validar campos requeridos
      if (!formData.title || formData.title.trim().length < 3) {
        setError('El título debe tener al menos 3 caracteres');
        return;
      }

      if (!formData.startDate || !formData.endDate) {
        setError('Las fechas de inicio y fin son requeridas');
        return;
      }

      // Convertir fechas de datetime-local a ISO
      // datetime-local devuelve formato "YYYY-MM-DDTHH:mm" que necesita convertirse a ISO
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      // Validar que endDate sea mayor que startDate
      if (endDate <= startDate) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }

      const payload = {
        organizationId: orgId,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        locationName: formData.locationName?.trim() || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      console.log('Enviando payload:', payload); // Debug

      await api.createEvent(payload);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', locationName: '', startDate: '', endDate: '' });
      fetchEvents();
    } catch (err) {
      console.error('Error al crear evento:', err); // Debug
      // Guardar error completo para mostrar detalles
      setError({
        message: err.message || 'Error al crear evento',
        details: err.details || [],
      });
    }
  };

  const handleCancel = async (eventId) => {
    if (!confirm('¿Estás seguro de cancelar este evento?')) return;
    
    try {
      await authFetch(`/events/${eventId}/cancel`, {
        method: 'POST',
        body: { reason: 'Cancelado por el organizador' },
      });
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Error al cancelar evento');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-gray-200 text-gray-800',
      PUBLISHED: 'bg-blue-500 text-white',
      IN_PROGRESS: 'bg-green-500 text-white',
      COMPLETED: 'bg-purple-500 text-white',
      CANCELLED: 'bg-red-500 text-white',
    };
    return styles[status] || 'bg-gray-200';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader
        title="Gestión de Eventos"
        subtitle="Crea y administra eventos para tu organización"
      />

      {error && (
        <ErrorAlert 
          message={typeof error === 'string' ? error : error.message || 'Error desconocido'}
          details={typeof error === 'object' ? error.details : undefined}
          onClose={() => setError(null)} 
        />
      )}

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Crear Evento
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(event.status)}`}>
                {event.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2 text-sm">
              {event.locationName && (
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">📍</span>
                  {event.locationName}
                </div>
              )}
              
              {event.startDate && (
                <div className="flex items-center text-gray-700">
                  <span className="mr-2">📅</span>
                  {new Date(event.startDate).toLocaleDateString('es-ES')}
                </div>
              )}
              
              <div className="flex items-center text-gray-700">
                <span className="mr-2">📋</span>
                {event._count?.tasks || 0} tareas
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate(`/dashboard/events/${event.id}`)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
              >
                Ver Detalles
              </button>
              
              {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleCancel(event.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Crear Nuevo Evento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Campaña de Reforestación 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe los objetivos del evento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Parque Nacional, Calle Principal, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Fin *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;

