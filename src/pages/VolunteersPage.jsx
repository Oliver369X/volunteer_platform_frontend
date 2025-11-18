'use strict';

import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import { useForm } from 'react-hook-form';
import InputField from '../components/InputField.jsx';

const VolunteersPage = () => {
  const api = useApi();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { register, handleSubmit } = useForm({
    defaultValues: { search: '', level: '' },
  });

  const loadVolunteers = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listVolunteers(filters);
      setVolunteers(Array.isArray(data) ? data : data?.volunteers ?? []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = (values) => {
    const filters = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
    );
    loadVolunteers(filters);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Voluntarios"
        description="Explora perfiles, habilidades y reputación para planificar tus despliegues."
      />

      <form
        onSubmit={handleSubmit(onFilter)}
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4"
      >
        <InputField
          label="Buscar"
          placeholder="Nombre, correo, habilidad..."
          {...register('search')}
          className="md:col-span-2"
        />
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
          Nivel
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register('level')}
          >
            <option value="">Todos</option>
            <option value="BRONCE">Bronce</option>
            <option value="PLATA">Plata</option>
            <option value="ORO">Oro</option>
            <option value="PLATINO">Platino</option>
          </select>
        </label>
        <button
          type="submit"
          className="md:col-span-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          Filtrar
        </button>
      </form>

      {loading ? (
        <LoadingSpinner label="Consultando voluntarios..." />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Voluntario</th>
                <th className="px-4 py-3 text-left">Nivel</th>
                <th className="px-4 py-3 text-left">Puntos</th>
                <th className="px-4 py-3 text-left">Habilidades</th>
                <th className="px-4 py-3 text-left">Ubicación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {volunteers.map((volunteer) => (
                <tr key={volunteer.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{volunteer.user?.fullName ?? 'Voluntario'}</p>
                    <p className="text-xs text-muted">{volunteer.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{volunteer.level ?? 'BRONCE'}</td>
                  <td className="px-4 py-3 text-sm text-muted">{volunteer.totalPoints ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {volunteer.skills?.slice(0, 5).join(', ') ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{volunteer.baseLocation ?? 'No definida'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VolunteersPage;



