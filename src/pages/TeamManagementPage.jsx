import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import useApi from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import { UserPlusIcon, UserGroupIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const TeamManagementPage = () => {
  const { user, authFetch } = useAuth();
  const api = useApi();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: '',
      role: 'COORDINATOR',
    },
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    }
  }, [organizationId]);

  const fetchOrganization = async () => {
    try {
      const orgs = await api.getOrganizationMemberships();
      if (orgs && orgs.length > 0) {
        setOrganizationId(orgs[0].id);
      }
    } catch (err) {
      setError('Error al cargar organización');
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const org = await api.getOrganizationDetails(organizationId);
      setMembers(org.members || []);
    } catch (err) {
      setError(err.message || 'Error al cargar miembros');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (data) => {
    try {
      await api.addOrganizationMember(organizationId, {
        email: data.email,
        role: data.role,
      });
      setShowInviteModal(false);
      reset();
      fetchMembers();
      alert('Invitación enviada exitosamente');
    } catch (err) {
      setError(err.message || 'Error al enviar invitación');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await authFetch(`/organizations/${organizationId}/members/${memberId}/role`, {
        method: 'PUT',
        body: { role: newRole },
      });
      fetchMembers();
      alert('Rol actualizado exitosamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar rol');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      OWNER: 'bg-purple-100 text-purple-800',
      COORDINATOR: 'bg-blue-100 text-blue-800',
      MEMBER: 'bg-gray-100 text-gray-800',
    };
    return styles[role] || styles.MEMBER;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <PageHeader
        title="Gestión de Equipo"
        subtitle="Administra los miembros y roles de tu organización"
      />

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlusIcon className="h-5 w-5" />
          Invitar Miembro
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5" />
            Miembros del Equipo ({members.length})
          </h3>
        </div>

        <div className="divide-y">
          {members.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay miembros en el equipo
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {member.user?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.user?.fullName || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-600">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      className={`px-3 py-1 rounded text-sm font-medium ${getRoleBadge(member.role)}`}
                      disabled={member.role === 'OWNER'}
                    >
                      <option value="OWNER">Propietario</option>
                      <option value="COORDINATOR">Coordinador</option>
                      <option value="MEMBER">Miembro</option>
                    </select>

                    {member.role === 'OWNER' && (
                      <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Invitar Nuevo Miembro</h2>

            <form onSubmit={handleSubmit(handleInvite)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'El correo es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo inválido',
                    },
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="nuevo@miembro.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rol *</label>
                <select
                  {...register('role', { required: 'El rol es requerido' })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="COORDINATOR">Coordinador</option>
                  <option value="MEMBER">Miembro</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;

