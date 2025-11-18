'use strict';

const LeaderboardTable = ({ items = [] }) => {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-muted">
        No hay datos disponibles para el período seleccionado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Posición</th>
            <th className="px-4 py-3">Voluntario</th>
            <th className="px-4 py-3">Nivel</th>
            <th className="px-4 py-3">Puntos totales</th>
            <th className="px-4 py-3">Puntos período</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => (
            <tr key={item.volunteerId}>
              <td className="px-4 py-3 text-sm font-semibold text-primary">{item.rank}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{item.fullName}</p>
                {item.email ? <p className="text-xs text-muted">{item.email}</p> : null}
              </td>
              <td className="px-4 py-3 text-sm text-muted">{item.level}</td>
              <td className="px-4 py-3 text-sm text-muted">{item.totalPoints ?? '--'}</td>
              <td className="px-4 py-3 text-sm text-muted">
                {item.timeframePoints !== undefined ? item.timeframePoints : '--'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;



