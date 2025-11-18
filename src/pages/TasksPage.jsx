'use strict';

import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import TaskTable from '../components/TaskTable.jsx';
import InputField from '../components/InputField.jsx';
import { useForm } from 'react-hook-form';

const TasksPage = () => {
  const api = useApi();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      status: '',
      urgency: '',
      search: '',
    },
  });

  const loadTasks = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks(filters);
      setTasks(Array.isArray(data) ? data : data?.tasks ?? []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = (values) => {
    const filters = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
    );
    loadTasks(filters);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de tareas"
        description="Visualiza y administra misiones activas, asignaciones y estados en tiempo real."
        actions={
          user?.role === 'ORGANIZATION' ? (
            <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark">
              Nueva misión
            </button>
          ) : null
        }
      />

      <form
        onSubmit={handleSubmit(onFilter)}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4"
      >
        <InputField
          label="Buscar"
          placeholder="Título, descripción..."
          {...register('search')}
          className="md:col-span-2"
        />
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Estado
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register('status')}
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="ASSIGNED">Asignada</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="COMPLETED">Completada</option>
            <option value="VERIFIED">Verificada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-ink">
          Urgencia
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register('urgency')}
          >
            <option value="">Todas</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </label>
        <button
          type="submit"
          className="md:col-span-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          Aplicar filtros
        </button>
      </form>

      {loading ? (
        <LoadingSpinner label="Cargando misiones..." />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <TaskTable tasks={tasks} />
      )}
    </div>
  );
};

export default TasksPage;



