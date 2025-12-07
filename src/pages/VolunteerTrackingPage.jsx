'use strict';

import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { MapPinIcon, SignalIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const VolunteerTrackingPage = () => {
  const { user, authFetch } = useAuth();
  const api = useApi();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingStates, setTrackingStates] = useState({});
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchMyAssignments();
    checkGeolocationSupport();
  }, [user]);

  const checkGeolocationSupport = () => {
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    // Verificar estado de permisos
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        if (result.state === 'denied') {
          setError('Los permisos de ubicación están denegados. Por favor habilítalos en la configuración del navegador.');
        }
      });
    }
  };

  const fetchMyAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMyAssignments();
      // Filtrar solo asignaciones activas que requieren tracking
      const activeAssignments = (data || []).filter(
        (a) => ['ACCEPTED', 'IN_PROGRESS'].includes(a.status) && a.task?.requiresLocationTracking
      );
      setAssignments(activeAssignments);
    } catch (err) {
      setError(err.message || 'Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return false;
    }

    return new Promise((resolve) => {
      // Intentar obtener ubicación para activar el prompt del navegador
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionStatus('granted');
          resolve(true);
        },
        (err) => {
          if (err.code === 1) {
            // PERMISSION_DENIED
            setPermissionStatus('denied');
            setError('Permisos de ubicación denegados. Por favor habilítalos en la configuración del navegador.');
            resolve(false);
          } else {
            setError('Error al obtener ubicación: ' + err.message);
            resolve(false);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const startTracking = async (assignmentId, taskId) => {
    // Verificar permisos primero
    if (permissionStatus === 'denied') {
      setError('Los permisos de ubicación están denegados. Por favor habilítalos en la configuración del navegador.');
      return;
    }

    if (permissionStatus === 'prompt') {
      setSelectedAssignment({ assignmentId, taskId });
      setShowPermissionModal(true);
      return;
    }

    await startTrackingInternal(assignmentId, taskId);
  };

  const startTrackingInternal = async (assignmentId, taskId) => {
    try {
      setError(null);
      
      // Obtener ubicación inicial (ya tenemos permiso en este punto)
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      // Enviar primera ubicación
      await authFetch('/tracking', {
        method: 'POST',
        body: {
          assignmentId,
          taskId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
      });

      // Iniciar tracking periódico
      const intervalId = setInterval(async () => {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          });

          await authFetch('/tracking', {
            method: 'POST',
            body: {
              assignmentId,
              taskId,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            },
          });
        } catch (err) {
          console.error('Error al actualizar ubicación:', err);
          // Si el permiso fue revocado, detener el tracking
          if (err.code === 1) {
            stopTracking(assignmentId);
            setPermissionStatus('denied');
            setError('Permisos de ubicación revocados. El tracking se ha detenido.');
          }
        }
      }, 30000); // Cada 30 segundos

      setTrackingStates((prev) => ({
        ...prev,
        [assignmentId]: { active: true, intervalId },
      }));

      // No usar alert, mejor mostrar un mensaje visual
      setError(null);
    } catch (err) {
      if (err.code === 1) {
        setPermissionStatus('denied');
        setError('Permisos de ubicación denegados. Por favor habilítalos en la configuración del navegador.');
      } else if (err.code === 2) {
        setError('No se pudo obtener tu ubicación. Verifica que el GPS esté activado.');
      } else if (err.code === 3) {
        setError('Tiempo de espera agotado. Intenta nuevamente.');
      } else {
        setError('Error al iniciar tracking: ' + (err.message || 'Error desconocido'));
      }
    }
  };

  const stopTracking = (assignmentId) => {
    const state = trackingStates[assignmentId];
    if (state?.intervalId) {
      clearInterval(state.intervalId);
    }

    setTrackingStates((prev) => ({
      ...prev,
      [assignmentId]: { active: false, intervalId: null },
    }));

    alert('Tracking GPS detenido');
  };

  const handlePermissionGranted = async () => {
    setShowPermissionModal(false);
    
    if (!selectedAssignment) return;

    // Intentar obtener ubicación - esto activará el prompt del navegador
    try {
      setError(null);
      
      // Llamar a getCurrentPosition para activar el prompt del navegador
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });

      // Si llegamos aquí, el permiso fue concedido
      setPermissionStatus('granted');
      
      // Iniciar tracking
      await startTrackingInternal(selectedAssignment.assignmentId, selectedAssignment.taskId);
      setSelectedAssignment(null);
    } catch (err) {
      if (err.code === 1) {
        // PERMISSION_DENIED
        setPermissionStatus('denied');
        setError('Permisos de ubicación denegados. Por favor habilítalos en la configuración del navegador.');
      } else if (err.code === 2) {
        // POSITION_UNAVAILABLE
        setError('No se pudo obtener tu ubicación. Verifica que el GPS esté activado.');
      } else if (err.code === 3) {
        // TIMEOUT
        setError('Tiempo de espera agotado al obtener tu ubicación. Intenta nuevamente.');
      } else {
        setError('Error al obtener ubicación: ' + err.message);
      }
      setSelectedAssignment(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (user?.role !== 'VOLUNTEER') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <MapPinIcon className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-ink">Solo para voluntarios</h3>
          <p className="mt-2 text-sm text-muted">
            Esta funcionalidad está disponible solo para voluntarios activos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Monitoreo de Ubicación GPS"
        subtitle="Comparte tu ubicación en tiempo real durante las misiones activas"
        icon={MapPinIcon}
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {/* Información sobre permisos */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Permisos de Ubicación</p>
            <p className="text-xs text-blue-800">
              Para compartir tu ubicación, necesitamos acceso a tu GPS. Tu ubicación solo se compartirá cuando actives el tracking para una misión específica.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Estado actual: <strong>{permissionStatus === 'granted' ? '✅ Permitido' : permissionStatus === 'denied' ? '❌ Denegado' : '⏳ Pendiente'}</strong>
            </p>
          </div>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MapPinIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No tienes misiones activas que requieran tracking GPS</p>
          <p className="text-sm text-gray-500 mt-2">
            Cuando aceptes una misión que requiera ubicación, aparecerá aquí
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const isTracking = trackingStates[assignment.id]?.active || false;

            return (
              <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{assignment.task?.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.task?.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Organización: {assignment.task?.organization?.name}
                    </p>
                    {assignment.task?.locationName && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 Ubicación: {assignment.task.locationName}
                      </p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isTracking 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isTracking ? '🟢 Activo' : '⚪ Inactivo'}
                  </div>
                </div>

                <div className="flex gap-3">
                  {!isTracking ? (
                    <button
                      onClick={() => startTracking(assignment.id, assignment.task.id)}
                      disabled={permissionStatus === 'denied'}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <MapPinIcon className="h-5 w-5" />
                      {permissionStatus === 'denied' 
                        ? 'Permisos Denegados' 
                        : 'Iniciar Tracking GPS'}
                    </button>
                  ) : (
                    <button
                      onClick={() => stopTracking(assignment.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <SignalIcon className="h-5 w-5" />
                      Detener Tracking
                    </button>
                  )}
                </div>

                {isTracking && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircleIcon className="h-5 w-5" />
                      <p className="text-sm font-semibold">Tracking activo</p>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Tu ubicación se está compartiendo cada 30 segundos. Los organizadores pueden ver tu ubicación en tiempo real.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Permisos */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MapPinIcon className="h-7 w-7 text-blue-600" />
              Permiso de Ubicación
            </h2>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-700">
                Para compartir tu ubicación durante esta misión, necesitamos acceso a tu GPS.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs font-medium text-blue-900 mb-2">ℹ️ Información:</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Tu ubicación solo se compartirá mientras el tracking esté activo</li>
                  <li>Se actualiza cada 30 segundos</li>
                  <li>Solo los organizadores de la misión pueden ver tu ubicación</li>
                  <li>Puedes detener el tracking en cualquier momento</li>
                </ul>
              </div>

              <p className="text-sm font-semibold text-gray-900">
                Al hacer clic en "Permitir Ubicación", tu navegador te pedirá permiso para acceder a tu ubicación.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                ⚠️ Asegúrate de hacer clic en "Permitir" cuando aparezca el mensaje del navegador.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  setSelectedAssignment(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePermissionGranted}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                Permitir Ubicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerTrackingPage;

