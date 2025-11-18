'use strict';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useApi from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import TaskTable from '../components/TaskTable.jsx';
import { formatNumber } from '../lib/formatters.js';

const MatchingPage = () => {
  const api = useApi();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [matching, setMatching] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { autoAssign: false, limit: 5 },
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getTasks({ status: ['PENDING', 'ASSIGNED'] });
        setTasks(Array.isArray(data) ? data : data?.tasks ?? []);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [api]);

  const onRunMatching = async (values) => {
    if (!selectedTask) return;
    try {
      setRunning(true);
      setError(null);
      const result = await api.runMatching(selectedTask.id, {
        autoAssign: values.autoAssign,
        limit: Number(values.limit ?? 5),
      });
      setMatching(result);
    } catch (matchError) {
      setError(matchError.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Motor de asignación inteligente"
        description="La IA evalúa habilidades, reputación y disponibilidad para sugerir el mejor emparejamiento voluntario-misión."
      />

      {loading ? (
        <LoadingSpinner label="Cargando misiones disponibles..." />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <>
          <TaskTable tasks={tasks} onSelect={setSelectedTask} />
          {selectedTask ? (
            <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-ink">{selectedTask.title}</h2>
                <p className="text-sm text-muted">{selectedTask.description}</p>
                <dl className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-2">
                  <div>
                    <dt className="font-medium text-ink">Urgencia</dt>
                    <dd>{selectedTask.urgency}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-ink">Voluntarios requeridos</dt>
                    <dd>{formatNumber(selectedTask.volunteersNeeded)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-ink">Habilidades necesarias</dt>
                    <dd>{selectedTask.skillsRequired?.join(', ') ?? 'No especificadas'}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-ink">Ubicación</dt>
                    <dd>{selectedTask.locationName ?? 'No especificada'}</dd>
                  </div>
                </dl>
              </div>
              <form
                onSubmit={handleSubmit(onRunMatching)}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-sm font-semibold text-ink">Parámetros de matching</h3>
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" {...register('autoAssign')} className="rounded border-slate-300" />
                  Autoasignar voluntarios sugeridos
                </label>
                <label className="flex flex-col gap-1 text-sm text-muted">
                  Límite de recomendaciones
                  <input
                    type="number"
                    min={1}
                    max={20}
                    {...register('limit')}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmitting || running}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
                >
                  {running ? 'Ejecutando IA...' : 'Generar recomendaciones'}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-muted">
              Selecciona una misión para ejecutar el motor de asignación inteligente.
            </div>
          )}
        </>
      )}

      {matching ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Resultados de IA</h2>
          <p className="text-sm text-muted">
            El motor analizó {matching.recommendations?.length ?? 0} perfiles y calculó afinidad con la
            misión seleccionada.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Voluntario</th>
                  <th className="px-4 py-3">Nivel</th>
                  <th className="px-4 py-3">Puntaje</th>
                  <th className="px-4 py-3">Coincidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {matching.recommendations?.map((item) => (
                  <tr key={item.volunteerId}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{item.volunteer?.fullName ?? 'Voluntario'}</p>
                      <p className="text-xs text-muted">{item.volunteer?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{item.volunteer?.level ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{item.score}</td>
                    <td className="px-4 py-3 text-xs text-muted">{item.ai?.justification ?? '—'}</td>
                  </tr>
                )) ?? null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MatchingPage;



