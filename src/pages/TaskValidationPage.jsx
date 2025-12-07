import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { CheckCircleIcon, XCircleIcon, PhotoIcon, StarIcon } from '@heroicons/react/24/outline';

const TaskValidationPage = () => {
  const { taskId } = useParams();
  const { authFetch } = useAuth();
  const api = useApi();
  const [task, setTask] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const taskData = await api.getTaskDetail(taskId);
      setTask(taskData);
      
      // Obtener asignaciones completadas pendientes de validación
      const completedAssignments = taskData.assignments?.filter(
        (a) => a.status === 'COMPLETED' && !a.rating
      ) || [];
      setAssignments(completedAssignments);
    } catch (err) {
      setError(err.message || 'Error al cargar tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (assignmentId, rating, approved = true) => {
    try {
      if (!approved) {
        // Si se rechaza, no se puede usar el endpoint de complete
        setError('Para rechazar una tarea, contacta al administrador');
        return;
      }

      // Usar el endpoint correcto de gamification para validar y calificar
      await authFetch(`/gamification/assignments/${assignmentId}/complete`, {
        method: 'POST',
        body: {
          rating: rating, // 1-5 estrellas
          feedback: `Tarea validada con calificación de ${rating} estrellas`,
          pointsAwarded: rating * 10, // 10 puntos por estrella
        },
      });
      fetchTaskDetails();
      setSelectedAssignment(null);
      alert(`Tarea validada exitosamente con ${rating} estrellas`);
    } catch (err) {
      setError(err.message || 'Error al validar tarea');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader
        title="Validación de Tareas"
        subtitle={`Tarea: ${task?.title || 'Cargando...'}`}
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No hay tareas pendientes de validación</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{assignment.volunteer?.fullName}</h3>
                  <p className="text-sm text-gray-600">{assignment.volunteer?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Completado: {new Date(assignment.completedAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAssignment(assignment)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Revisar
                </button>
              </div>

              {assignment.evidenceUrl && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Evidencia:</p>
                  <img
                    src={assignment.evidenceUrl}
                    alt="Evidencia"
                    className="max-w-md rounded-lg border"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
              )}

              {assignment.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium mb-1">Notas del voluntario:</p>
                  <p className="text-sm text-gray-700">{assignment.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Validación */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Validar Tarea</h2>

            <div className="space-y-4 mb-6">
              <div>
                <p className="font-medium">Voluntario:</p>
                <p className="text-gray-600">{selectedAssignment.volunteer?.fullName}</p>
              </div>

              {selectedAssignment.evidenceUrl && (
                <div>
                  <p className="font-medium mb-2">Evidencia:</p>
                  <img
                    src={selectedAssignment.evidenceUrl}
                    alt="Evidencia"
                    className="max-w-full rounded-lg border"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
              )}

              {selectedAssignment.notes && (
                <div>
                  <p className="font-medium mb-1">Notas:</p>
                  <p className="text-gray-700">{selectedAssignment.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Calificación (1-5 estrellas)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleValidate(selectedAssignment.id, rating, true)}
                      className="p-2 border rounded hover:bg-yellow-50"
                    >
                      <StarIcon className="h-6 w-6 text-yellow-400" />
                      <span className="text-xs">{rating}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskValidationPage;

