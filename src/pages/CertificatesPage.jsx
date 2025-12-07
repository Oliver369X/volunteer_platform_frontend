'use strict';

import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import useAuth from '../hooks/useAuth';
import { SparklesIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const CertificatesPage = () => {
  const { user, authFetch } = useAuth();
  const api = useApi();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    fetchVerifiedAssignments();
  }, [user]);

  const fetchVerifiedAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch('/certificates/assignments/verified');
      // El backend devuelve { status: 'success', data: [...] }
      const data = response.data || response;
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar asignaciones');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (assignmentId, volunteerId) => {
    if (!confirm('¿Emitir certificado NFT para este voluntario?')) return;

    try {
      setIssuing(true);
      setError(null);
      
      const response = await authFetch('/certificates/issue', {
        method: 'POST',
        body: {
          assignmentId,
          volunteerId,
        },
      });

      alert('✅ Certificado NFT emitido exitosamente');
      fetchVerifiedAssignments();
      setSelectedAssignment(null);
    } catch (err) {
      setError(err.message || 'Error al emitir certificado');
    } finally {
      setIssuing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (user?.role !== 'ORGANIZATION' && user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <SparklesIcon className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-ink">Solo para organizaciones</h3>
          <p className="mt-2 text-sm text-muted">
            Esta funcionalidad está disponible solo para organizaciones verificadas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Emisión de Certificados NFT"
        subtitle="Emite certificados digitales verificables en blockchain para voluntarios"
        icon={SparklesIcon}
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No hay asignaciones verificadas pendientes de certificado</p>
          <p className="text-sm text-gray-500 mt-2">
            Los certificados se emiten automáticamente cuando validas una tarea con 4 o 5 estrellas
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{assignment.volunteer?.fullName}</h3>
                  <p className="text-sm text-gray-600">{assignment.volunteer?.email}</p>
                  <p className="text-sm font-medium text-gray-800 mt-2">
                    Tarea: {assignment.task?.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Organización: {assignment.task?.organization?.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Verificado: {new Date(assignment.completedAt).toLocaleString('es-ES')}
                  </p>
                  {assignment.rating && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-yellow-600">
                        ⭐ Calificación: {assignment.rating}/5
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedAssignment(assignment)}
                  disabled={issuing}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <SparklesIcon className="h-5 w-5" />
                  Emitir Certificado NFT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-7 w-7 text-purple-600" />
              Emitir Certificado NFT
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-2">Detalles del Certificado:</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Voluntario:</strong> {selectedAssignment.volunteer?.fullName}</p>
                  <p><strong>Tarea:</strong> {selectedAssignment.task?.title}</p>
                  <p><strong>Organización:</strong> {selectedAssignment.task?.organization?.name}</p>
                  {selectedAssignment.rating && (
                    <p><strong>Calificación:</strong> {selectedAssignment.rating}/5 estrellas</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs font-medium text-blue-900 mb-1">ℹ️ Información:</p>
                <p className="text-xs text-blue-800">
                  Este certificado será minteado como NFT en blockchain, será único, verificable y permanente.
                  El voluntario recibirá una notificación cuando el certificado esté listo.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setSelectedAssignment(null)}
                disabled={issuing}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleIssueCertificate(selectedAssignment.id, selectedAssignment.volunteerId)}
                disabled={issuing}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {issuing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Emitiendo...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5" />
                    Confirmar Emisión
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;

