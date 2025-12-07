import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';

const IncidentsPage = () => {
  const api = useApi();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('OPEN');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECNICO',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.listIncidents({ status: filter });
      setIncidents(data);
    } catch (err) {
      setError(err.message || 'Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createIncident(formData);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', category: 'TECNICO', priority: 'MEDIUM' });
      fetchIncidents();
      alert('Incidencia reportada exitosamente');
    } catch (err) {
      setError(err.message || 'Error al crear incidencia');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[priority] || colors.MEDIUM;
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-red-100 text-red-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.OPEN;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader
        title="Gestión de Incidencias"
        subtitle="Reporta problemas y gestiona disputas"
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          🚨 Reportar Problema
        </button>
      </div>

      <div className="grid gap-4">
        {incidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No hay incidencias con estado {filter}
          </div>
        ) : (
          incidents.map((incident) => (
            <div key={incident.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{incident.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(incident.priority)}`}>
                      {incident.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{incident.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>📁 {incident.category}</span>
                    <span>👤 {incident.reporter.fullName}</span>
                    <span>📅 {new Date(incident.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>

              {incident.resolution && (
                <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-1">Resolución:</p>
                  <p className="text-sm text-green-700">{incident.resolution}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Reportar Incidencia</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Describe brevemente el problema"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Detalla lo ocurrido..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="SEGURIDAD">Seguridad</option>
                    <option value="CONDUCTA">Conducta</option>
                    <option value="TECNICO">Técnico</option>
                    <option value="LOGISTICA">Logística</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Prioridad *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reportar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default IncidentsPage;

