'use strict';

import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import useAuth from '../hooks/useAuth.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import TaskTable from '../components/TaskTable.jsx';
import InputField from '../components/InputField.jsx';
import CreateTaskModal from '../components/CreateTaskModal.jsx';
import Pagination from '../components/Pagination.jsx';
import { useForm } from 'react-hook-form';

const TasksPage = () => {
  const api = useApi();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      status: '',
      urgency: '',
      search: '',
      category: '',
    },
  });

  // Obtener organizationId del usuario
  useEffect(() => {
    const fetchOrganization = async () => {
      if (user?.role === 'ORGANIZATION') {
        try {
          const orgs = await api.getOrganizationMemberships();
          if (orgs && orgs.length > 0) {
            setOrganizationId(orgs[0].id);
          }
        } catch (err) {
          console.error('Error al obtener organización:', err);
        }
      }
    };
    fetchOrganization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const loadTasks = async (filters = {}, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page,
        limit: pagination.itemsPerPage,
      };
      
      const data = await api.getTasks(params);
      
      // Manejar respuesta con o sin paginación
      if (data?.tasks && data?.pagination) {
        setTasks(data.tasks);
        setPagination({
          currentPage: data.pagination.page || page,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.total || data.tasks.length,
          itemsPerPage: data.pagination.limit || 20,
        });
      } else {
        // Fallback si el backend no retorna paginación
        const tasksList = Array.isArray(data) ? data : data?.tasks ?? [];
        setTasks(tasksList);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: tasksList.length,
          itemsPerPage: 20,
        });
      }
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentFilters, setCurrentFilters] = useState({});

  useEffect(() => {
    loadTasks(currentFilters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = (values) => {
    const filters = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
    );
    setCurrentFilters(filters);
    loadTasks(filters, 1);
  };

  const handlePageChange = (page) => {
    loadTasks(currentFilters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de tareas"
        description="Visualiza y administra misiones activas, asignaciones y estados en tiempo real."
        actions={
          user?.role === 'ORGANIZATION' ? (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark"
            >
              Nueva misión
            </button>
          ) : null
        }
      />

      <form
        onSubmit={handleSubmit(onFilter)}
        className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-lg animate-slide-up"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InputField
            label="🔍 Buscar"
            placeholder="Título, descripción..."
            {...register('search')}
            className="lg:col-span-2"
          />
          
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              📊 Estado
            </label>
            <select
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              {...register('status')}
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">⏳ Pendiente</option>
              <option value="ASSIGNED">📋 Asignada</option>
              <option value="IN_PROGRESS">🔄 En progreso</option>
              <option value="COMPLETED">✅ Completada</option>
              <option value="VERIFIED">🎉 Verificada</option>
              <option value="CANCELLED">❌ Cancelada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              🚨 Urgencia
            </label>
            <select
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              {...register('urgency')}
            >
              <option value="">Todas</option>
              <option value="LOW">🟢 Baja</option>
              <option value="MEDIUM">🟡 Media</option>
              <option value="HIGH">🟠 Alta</option>
              <option value="CRITICAL">🔴 Crítica</option>
            </select>
          </div>

          <InputField
            label="🏷️ Categoría"
            placeholder="Salud, Educación..."
            {...register('category')}
            className="sm:col-span-2 lg:col-span-1"
          />

          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-2 lg:col-span-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
          >
            🎯 Aplicar Filtros
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner label="Cargando misiones..." />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <>
          <TaskTable tasks={tasks} />
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={(newTask) => {
          setTasks([newTask, ...tasks]);
          loadTasks(currentFilters, pagination.currentPage);
        }}
        api={api}
        organizationId={organizationId}
      />
    </div>
  );
};

export default TasksPage;



