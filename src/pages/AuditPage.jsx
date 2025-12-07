import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheckIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const AuditPage = () => {
  const { user, authFetch } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userId: '',
    eventId: '',
    action: '',
  });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchLogs();
    } else {
      setError('Solo administradores pueden acceder a esta página');
      setLoading(false);
    }
  }, [user, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      ).toString();
      
      const response = await authFetch(`/audit?${query}`);
      // El backend devuelve { status: 'success', data: [...] }
      const data = response.data || response;
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar logs de auditoría');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      ).toString();
      
      const tokens = JSON.parse(localStorage.getItem('vip.auth.tokens') || '{}');
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_URL}/audit/export?${query}`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error al exportar reporte: ' + err.message);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <ErrorAlert message="Solo administradores pueden acceder a esta página" />
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader
        title="Reportes de Auditoría"
        subtitle="Registro de todas las acciones del sistema"
        icon={ShieldCheckIcon}
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Usuario ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="UUID del usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Evento ID</label>
            <input
              type="text"
              value={filters.eventId}
              onChange={(e) => setFilters({ ...filters, eventId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="UUID del evento"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Acción</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Todas</option>
              <option value="CREATE">Crear</option>
              <option value="UPDATE">Actualizar</option>
              <option value="DELETE">Eliminar</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Logs de Auditoría ({logs.length})</h3>
        </div>

        <div className="divide-y">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay logs de auditoría con los filtros seleccionados
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-600">
                        {log.actorType} - {log.actorId}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {log.entityType}: {log.entityId}
                    </p>
                    {log.metadata && (
                      <p className="text-xs text-gray-500 mt-1">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString('es-ES')}
                    </p>
                    {log.ipAddress && (
                      <p className="text-xs text-gray-400 mt-1">IP: {log.ipAddress}</p>
                    )}
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

export default AuditPage;

