'use strict';

import { formatDateTime } from '../lib/formatters.js';

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const urgencyColors = {
  LOW: 'text-emerald-600',
  MEDIUM: 'text-amber-600',
  HIGH: 'text-orange-600',
  CRITICAL: 'text-red-600',
};

const TaskTable = ({ tasks = [], onSelect }) => {
  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted">
        No hay tareas registradas en este momento.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Título</th>
            <th className="px-4 py-3">Urgencia</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Voluntarios</th>
            <th className="px-4 py-3">Inicio</th>
            <th className="px-4 py-3">Fin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="hover:bg-slate-50 cursor-pointer"
              onClick={() => onSelect?.(task)}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{task.title}</p>
                <p className="text-xs text-muted line-clamp-1">{task.description}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold ${urgencyColors[task.urgency] ?? ''}`}>
                  {task.urgency}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    statusColors[task.status] ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {task.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted">
                {task.assignments?.filter((a) => a.status !== 'REJECTED').length ?? 0}/
                {task.volunteersNeeded}
              </td>
              <td className="px-4 py-3 text-sm text-muted">{formatDateTime(task.startAt)}</td>
              <td className="px-4 py-3 text-sm text-muted">{formatDateTime(task.endAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;



