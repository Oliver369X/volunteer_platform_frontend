import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import VolunteerMap from '../components/VolunteerMap';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';

const TrackingMapPage = () => {
  const { eventId } = useParams();
  const api = useApi();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLocations();
    
    // Auto-refresh cada 30 segundos si está activado
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLocations, 30000);
    }
    
    return () => clearInterval(interval);
  }, [eventId, autoRefresh]);

  const fetchLocations = async () => {
    try {
      const data = await api.getEventVolunteersLocations(eventId);
      setLocations(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error al cargar ubicaciones');
      setLoading(false);
    }
  };

  const getStatusColor = (location) => {
    const minutesAgo = (new Date() - new Date(location.recordedAt)) / 60000;
    if (minutesAgo < 10) return 'bg-green-500'; // Activo
    if (minutesAgo < 30) return 'bg-yellow-500'; // Sin actualizar
    return 'bg-red-500'; // Sin señal
  };

  const getStatusText = (location) => {
    const minutesAgo = Math.floor((new Date() - new Date(location.recordedAt)) / 60000);
    if (minutesAgo < 10) return `Activo (hace ${minutesAgo} min)`;
    if (minutesAgo < 30) return `Sin actualizar (hace ${minutesAgo} min)`;
    return 'Sin señal (> 30 min)';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader
        title="Mapa de Operaciones"
        subtitle="Ubicación en tiempo real de voluntarios activos"
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Activo (&lt; 10 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Sin actualizar (10-30 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Sin señal (&gt; 30 min)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Auto-actualizar (30s)</span>
          </label>
          <button
            onClick={fetchLocations}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Mapa Real con Leaflet */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <VolunteerMap locations={locations} />
      </div>

      {/* Lista de Voluntarios */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Voluntarios Activos ({locations.length})</h3>
        </div>
        
        <div className="divide-y">
          {locations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay voluntarios activos en este evento
            </div>
          ) : (
            locations.map((loc) => (
              <div key={loc.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(loc)}`}></div>
                    <div>
                      <p className="font-medium">{loc.volunteer.fullName}</p>
                      <p className="text-sm text-gray-600">{loc.task?.title}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">{getStatusText(loc)}</p>
                    <p className="text-xs text-gray-500">
                      📍 {parseFloat(loc.latitude).toFixed(4)}, {parseFloat(loc.longitude).toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingMapPage;

