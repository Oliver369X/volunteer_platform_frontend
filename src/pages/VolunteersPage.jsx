'use strict';

import { useEffect, useState } from 'react';
import useApi from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import Pagination from '../components/Pagination.jsx';
import { useForm } from 'react-hook-form';
import InputField from '../components/InputField.jsx';

const VolunteersPage = () => {
  const api = useApi();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const { register, handleSubmit } = useForm({
    defaultValues: { search: '', level: '' },
  });

  const [currentFilters, setCurrentFilters] = useState({});

  const loadVolunteers = async (filters = {}, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page,
        limit: pagination.itemsPerPage,
      };
      
      const data = await api.listVolunteers(params);
      
      // Manejar respuesta con o sin paginación
      if (data?.volunteers && data?.pagination) {
        setVolunteers(data.volunteers);
        setPagination({
          currentPage: data.pagination.page || page,
          totalPages: data.pagination.totalPages || 1,
          totalItems: data.pagination.total || data.volunteers.length,
          itemsPerPage: data.pagination.limit || 20,
        });
      } else {
        // Fallback
        const volunteersList = Array.isArray(data) ? data : data?.volunteers ?? [];
        setVolunteers(volunteersList);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: volunteersList.length,
          itemsPerPage: 20,
        });
      }
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolunteers(currentFilters, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilter = (values) => {
    const filters = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value !== '' && value !== undefined),
    );
    setCurrentFilters(filters);
    loadVolunteers(filters, 1);
  };

  const handlePageChange = (page) => {
    loadVolunteers(currentFilters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <>
          <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-xs font-bold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-4 text-left">👤 Voluntario</th>
                    <th className="px-4 py-4 text-left">🎖️ Nivel</th>
                    <th className="px-4 py-4 text-left">⭐ Puntos</th>
                    <th className="px-4 py-4 text-left">✨ Habilidades</th>
                    <th className="px-4 py-4 text-left">📍 Ubicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {volunteers.map((volunteer, idx) => (
                    <tr 
                      key={volunteer.id}
                      className="hover:bg-slate-50 transition-colors animate-slide-up"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold shadow-lg">
                            {volunteer.user?.fullName?.charAt(0)?.toUpperCase() || 'V'}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">{volunteer.user?.fullName ?? 'Voluntario'}</p>
                            <p className="text-xs text-muted">{volunteer.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                          {volunteer.level ?? 'BRONCE'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-bold text-ink">{(volunteer.totalPoints ?? 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted max-w-xs">
                        {volunteer.skills && volunteer.skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {volunteer.skills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                {skill}
                              </span>
                            ))}
                            {volunteer.skills.length > 3 && (
                              <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                +{volunteer.skills.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">{volunteer.baseLocation ?? 'No definida'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default VolunteersPage;



