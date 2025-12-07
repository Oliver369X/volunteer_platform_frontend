import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import useApi from '../hooks/useApi';
import { MapPinIcon, SignalIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Componente para que los voluntarios compartan su ubicación GPS en tiempo real
 * Se activa automáticamente cuando están en una tarea activa
 */
const LocationTracker = ({ taskId, assignmentId, isActive = false }) => {
  const { authFetch } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const intervalRef = useRef(null);

  // Verificar soporte y permisos
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    // Verificar estado de permisos
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        result.onchange = () => {
          setPermissionStatus(result.state);
          if (result.state === 'denied') {
            setIsTracking(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        };
      });
    }
  }, []);

  // Solicitar permisos de geolocalización
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return false;
    }

    if (permissionStatus === 'denied') {
      setError('Permisos de ubicación denegados. Por favor habilítalos en la configuración del navegador.');
      return false;
    }

    // Si está en prompt, mostrar modal
    if (permissionStatus === 'prompt') {
      setShowPermissionPrompt(true);
      return false;
    }

    return true;
  };

  // Obtener ubicación actual
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Enviar ubicación al servidor
  const sendLocation = async (location) => {
    try {
      await authFetch('/tracking', {
        method: 'POST',
        body: {
          assignmentId,
          taskId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
      });
      setCurrentLocation(location);
      setError(null);
    } catch (err) {
      console.error('Error al enviar ubicación:', err);
      setError('Error al compartir ubicación');
    }
  };

  // Iniciar tracking
  const startTracking = async () => {
    // Verificar si necesitamos mostrar el modal de permisos
    const hasPermission = await requestLocationPermission();
    if (!hasPermission && !showPermissionPrompt) return;

    // Si necesita permiso, mostrar modal y esperar
    if (showPermissionPrompt) {
      return;
    }

    // Si ya tenemos permiso, iniciar directamente
    setIsTracking(true);
    setError(null);

    // Enviar ubicación inmediatamente
    try {
      const location = await getCurrentLocation();
      await sendLocation(location);
      setPermissionStatus('granted');
    } catch (err) {
      if (err.code === 1) {
        // PERMISSION_DENIED
        setPermissionStatus('denied');
        setError('Permisos de ubicación denegados. Por favor habilítalos en la configuración del navegador.');
      } else if (err.code === 2) {
        setError('No se pudo obtener tu ubicación. Verifica que el GPS esté activado.');
      } else if (err.code === 3) {
        setError('Tiempo de espera agotado. Intenta nuevamente.');
      } else {
        setError('Error al obtener ubicación: ' + err.message);
      }
      setIsTracking(false);
      return;
    }

    // Enviar ubicación cada 30 segundos
    intervalRef.current = setInterval(async () => {
      try {
        const location = await getCurrentLocation();
        await sendLocation(location);
      } catch (err) {
        console.error('Error al actualizar ubicación:', err);
        if (err.code === 1) {
          setIsTracking(false);
          clearInterval(intervalRef.current);
          setPermissionStatus('denied');
          setError('Permisos de ubicación revocados. El tracking se ha detenido.');
        }
      }
    }, 30000); // Cada 30 segundos
  };

  const handlePermissionGranted = async () => {
    setShowPermissionPrompt(false);
    
    // Intentar obtener ubicación - esto activará el prompt del navegador
    try {
      setError(null);
      
      // Llamar a getCurrentPosition para activar el prompt del navegador
      const location = await getCurrentLocation();
      
      // Si llegamos aquí, el permiso fue concedido
      setPermissionStatus('granted');
      
      // Iniciar tracking
      setIsTracking(true);
      await sendLocation(location);

      // Iniciar tracking periódico
      intervalRef.current = setInterval(async () => {
        try {
          const loc = await getCurrentLocation();
          await sendLocation(loc);
        } catch (err) {
          console.error('Error al actualizar ubicación:', err);
          if (err.code === 1) {
            setIsTracking(false);
            clearInterval(intervalRef.current);
            setPermissionStatus('denied');
            setError('Permisos de ubicación revocados. El tracking se ha detenido.');
          }
        }
      }, 30000); // Cada 30 segundos
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
    }
  };

  // Detener tracking
  const stopTracking = () => {
    setIsTracking(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Auto-iniciar si está activo
  useEffect(() => {
    if (isActive && !isTracking) {
      startTracking();
    } else if (!isActive && isTracking) {
      stopTracking();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-sm">Compartir Ubicación GPS</h3>
          </div>
          <div className={`flex items-center gap-2 ${isTracking ? 'text-green-600' : 'text-gray-400'}`}>
            <SignalIcon className="h-4 w-4" />
            <span className="text-xs font-medium">
              {isTracking ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-start gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {permissionStatus === 'denied' && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
            ⚠️ Los permisos de ubicación están denegados. Ve a la configuración del navegador para habilitarlos.
          </div>
        )}

        {currentLocation && isTracking && (
          <div className="text-xs text-gray-600 space-y-1 mb-3 p-2 bg-green-50 rounded">
            <p className="font-semibold text-green-800">
              ✅ Última ubicación enviada: {new Date(currentLocation.timestamp).toLocaleTimeString()}
            </p>
            <p className="text-green-700">
              Precisión: ±{Math.round(currentLocation.accuracy)}m
            </p>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          {!isTracking ? (
            <button
              onClick={startTracking}
              disabled={permissionStatus === 'denied'}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <MapPinIcon className="h-4 w-4" />
              {permissionStatus === 'denied' ? 'Permisos Denegados' : 'Iniciar Tracking GPS'}
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <SignalIcon className="h-4 w-4" />
              Detener Tracking
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Tu ubicación se compartirá cada 30 segundos mientras el tracking esté activo. Solo los organizadores pueden ver tu ubicación.
        </p>
      </div>

      {/* Modal de Permisos */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPinIcon className="h-6 w-6 text-blue-600" />
              Permiso de Ubicación Requerido
            </h2>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-700">
                Para compartir tu ubicación durante esta misión, necesitamos acceso a tu GPS.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
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
                  setShowPermissionPrompt(false);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePermissionGranted}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Permitir Ubicación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocationTracker;

