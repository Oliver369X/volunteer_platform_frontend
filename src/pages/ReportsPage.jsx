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

  const exportReport = (format) => {
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
  };

  if (loading) {
    return <LoadingSpinner label="Generando reportes..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  const hasData = user?.role === 'VOLUNTEER' ? volunteerReport : organizationReport;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inteligencia y métricas"
        description="Analiza desempeño, impacto y asignación de recursos para tomar decisiones basadas en datos."
        actions={
          hasData ? (
            <div className="flex gap-2">
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
          <div className="grid gap-4 md:grid-cols-4">
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
              title="Reconocimientos otorgados"
              value={formatPoints(organizationReport?.recognition?.totalPointsAwarded ?? 0)}
              tone="success"
            />
            <StatCard
              title="Tasa de cumplimiento"
              value={formatPercentage(organizationReport?.assignments?.completionRate)}
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Top voluntarios</h2>
            <div className="mt-4 divide-y divide-slate-200">
              {organizationReport?.topVolunteers?.map((volunteer) => (
                <div key={volunteer.volunteerId} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{volunteer.fullName ?? 'Voluntario'}</p>
                    <p className="text-xs text-muted">{volunteer.email}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {formatNumber(volunteer.assignmentsCompleted)} misiones
                  </p>
                </div>
              )) ?? <p className="text-sm text-muted">Sin datos suficientes.</p>}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">Matriz de misiones</h2>
            <TaskTable tasks={tasks} />
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;



