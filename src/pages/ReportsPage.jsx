'use strict';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth.js';
import useApi from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import StatCard from '../components/StatCard.jsx';
import { formatNumber, formatPoints, formatPercentage } from '../lib/formatters.js';
import TaskTable from '../components/TaskTable.jsx';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ReportsPage = () => {
  const { user } = useAuth();
  const api = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizationReport, setOrganizationReport] = useState(null);
  const [volunteerReport, setVolunteerReport] = useState(null);
  const [tasks, setTasks] = useState([]);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      from: '',
      to: '',
    },
  });

  const loadData = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      if (user?.role === 'VOLUNTEER') {
        const report = await api.getVolunteerReport(filters);
        setVolunteerReport(report);
      } else {
        const memberships = await api.getOrganizationMemberships();
        const primaryOrg = memberships?.[0]?.id;
        if (!primaryOrg) {
          throw new Error('No se encontró organización asociada');
        }
        const report = await api.getOrganizationReport({ organizationId: primaryOrg, ...filters });
        setOrganizationReport(report);
        const data = await api.getTasks({ organizationId: primaryOrg });
        setTasks(Array.isArray(data) ? data : data?.tasks ?? []);
      }
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = (values) => {
    const filters = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value && value.trim() !== ''),
    );
    loadData(filters);
  };

  const exportReport = async (format) => {
    try {
      if (format === 'pdf') {
        const memberships = user?.role === 'ORGANIZATION' ? await api.getOrganizationMemberships() : null;
        const primaryOrg = memberships?.[0]?.id;
        
        const queryParams = new URLSearchParams();
        if (user?.role === 'ORGANIZATION' && primaryOrg) {
          queryParams.append('organizationId', primaryOrg);
        }
        
        const endpoint = user?.role === 'VOLUNTEER' 
          ? `/reports/volunteer/export?${queryParams.toString()}`
          : `/reports/organization/export?${queryParams.toString()}`;
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('vip.auth.tokens') || '{}').accessToken || ''}`,
          },
        });
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${user?.role.toLowerCase()}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

      const data = user?.role === 'VOLUNTEER' ? volunteerReport : organizationReport;
      const filename = `reporte_${user?.role.toLowerCase()}_${Date.now()}`;

      if (format === 'json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.json`;
        link.click();
      } else if (format === 'csv' && tasks.length > 0) {
        const headers = ['Título', 'Estado', 'Urgencia', 'Categoría', 'Voluntarios Necesarios', 'Fecha Inicio'];
        const rows = tasks.map((task) => [
          task.title || '',
          task.status || '',
          task.urgency || '',
          task.category || '',
          task.volunteersNeeded || 0,
          task.startAt ? new Date(task.startAt).toLocaleDateString() : '',
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
      }
    } catch (err) {
      console.error('Error al exportar reporte:', err);
      alert('Error al exportar el reporte');
    }
  };

  // Preparar datos para gráficas
  const prepareStatusData = () => {
    if (!organizationReport?.tasks?.byStatus) return [];
    return Object.entries(organizationReport.tasks.byStatus).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count || 0,
    }));
  };

  const prepareCategoryData = () => {
    const categoryMap = {};
    tasks.forEach((task) => {
      const category = task.category || 'Sin categoría';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  };

  const prepareUrgencyData = () => {
    const urgencyMap = {};
    tasks.forEach((task) => {
      const urgency = task.urgency || 'MEDIA';
      urgencyMap[urgency] = (urgencyMap[urgency] || 0) + 1;
    });
    return Object.entries(urgencyMap).map(([name, value]) => ({ name, value }));
  };

  const prepareTopVolunteersData = () => {
    if (!organizationReport?.topVolunteers) return [];
    return organizationReport.topVolunteers.slice(0, 10).map((v) => ({
      name: v.fullName?.split(' ')[0] || 'Voluntario',
      misiones: v.assignmentsCompleted || 0,
    }));
  };

  const prepareTimelineData = () => {
    // Agrupar tareas por mes
    const monthMap = {};
    tasks.forEach((task) => {
      if (task.createdAt) {
        const date = new Date(task.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
      }
    });
    return Object.entries(monthMap)
      .sort()
      .slice(-6)
      .map(([month, count]) => ({
        mes: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
        tareas: count,
      }));
  };

  if (loading) {
    return <LoadingSpinner label="Generando reportes..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  const hasData = user?.role === 'VOLUNTEER' ? volunteerReport : organizationReport;
  const statusData = prepareStatusData();
  const categoryData = prepareCategoryData();
  const urgencyData = prepareUrgencyData();
  const topVolunteersData = prepareTopVolunteersData();
  const timelineData = prepareTimelineData();

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Inteligencia y métricas"
        description="Analiza desempeño, impacto y asignación de recursos para tomar decisiones basadas en datos."
        actions={
          hasData ? (
            <div className="flex gap-2">
              <button
                onClick={() => exportReport('pdf')}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Exportar PDF
              </button>
              <button
                onClick={() => exportReport('json')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm hover:bg-slate-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Exportar JSON
              </button>
              {tasks.length > 0 ? (
                <button
                  onClick={() => exportReport('csv')}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-dark"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Exportar CSV
                </button>
              ) : null}
            </div>
          ) : null
        }
      />

      <form
        onSubmit={handleSubmit(onFilter)}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <label className="flex flex-col text-xs font-semibold text-muted">
          Desde
          <input
            type="date"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register('from')}
          />
        </label>
        <label className="flex flex-col text-xs font-semibold text-muted">
          Hasta
          <input
            type="date"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register('to')}
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          Actualizar
        </button>
      </form>

      {user?.role === 'VOLUNTEER' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Puntos en período" value={formatPoints(volunteerReport?.pointsEarnedInPeriod ?? 0)} />
          <StatCard
            title="Misiones completadas"
            value={formatNumber(volunteerReport?.assignmentsCompleted ?? 0)}
            tone="success"
          />
          <StatCard
            title="Nivel actual"
            value={volunteerReport?.level ?? '--'}
            tone="warning"
          />
        </div>
      ) : (
        <>
          {/* Métricas principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Misiones totales"
              value={formatNumber(organizationReport?.tasks?.total ?? 0)}
            />
            <StatCard
              title="Misiones en progreso"
              value={formatNumber(organizationReport?.tasks?.byStatus?.IN_PROGRESS ?? 0)}
              tone="warning"
            />
            <StatCard
              title="Misiones completadas"
              value={formatNumber(organizationReport?.tasks?.byStatus?.COMPLETED ?? 0)}
              tone="success"
            />
            <StatCard
              title="Reconocimientos otorgados"
              value={formatPoints(organizationReport?.recognition?.totalPointsAwarded ?? 0)}
              tone="success"
            />
            <StatCard
              title="Tasa de cumplimiento"
              value={formatPercentage(organizationReport?.assignments?.completionRate)}
            />
            <StatCard
              title="Voluntarios activos"
              value={formatNumber(organizationReport?.topVolunteers?.length ?? 0)}
            />
            <StatCard
              title="Asignaciones totales"
              value={formatNumber(organizationReport?.assignments?.total ?? 0)}
            />
            <StatCard
              title="Tasa de éxito"
              value={formatPercentage(
                organizationReport?.assignments?.total > 0
                  ? (organizationReport?.assignments?.completed / organizationReport?.assignments?.total) * 100
                  : 0
              )}
              tone="success"
            />
          </div>

          {/* Gráficas */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfica de barras - Tareas por estado */}
            {statusData.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-ink mb-4">Tareas por Estado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfica de pastel - Distribución por categoría */}
            {categoryData.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-ink mb-4">Distribución por Categoría</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfica de líneas - Tendencia temporal */}
            {timelineData.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-ink mb-4">Tendencia de Tareas (Últimos 6 meses)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="tareas" stroke="#10b981" strokeWidth={2} name="Tareas creadas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfica de barras - Top voluntarios */}
            {topVolunteersData.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-ink mb-4">Top 10 Voluntarios</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topVolunteersData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="misiones" fill="#8b5cf6" name="Misiones completadas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Gráfica de urgencia */}
          {urgencyData.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-ink mb-4">Distribución por Urgencia</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={urgencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#f59e0b" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top voluntarios - Lista */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink mb-4">Top Voluntarios</h2>
            <div className="mt-4 divide-y divide-slate-200">
              {organizationReport?.topVolunteers?.length > 0 ? (
                organizationReport.topVolunteers.map((volunteer, index) => (
                  <div key={volunteer.volunteerId} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{volunteer.fullName ?? 'Voluntario'}</p>
                        <p className="text-xs text-muted">{volunteer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        {formatNumber(volunteer.assignmentsCompleted)} misiones
                      </p>
                      {volunteer.pointsEarned && (
                        <p className="text-xs text-muted">{formatPoints(volunteer.pointsEarned)} puntos</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted py-4">Sin datos suficientes.</p>
              )}
            </div>
          </div>

          {/* Matriz de misiones */}
          {tasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-ink">Matriz de Misiones</h2>
              <TaskTable tasks={tasks} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
