'use strict';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth.js';
import useApi from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import {
  UserCircleIcon,
  LockClosedIcon,
  CheckCircleIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const { user, fetchCurrentUser } = useAuth();
  const api = useApi();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { isSubmitting: isSubmittingProfile, errors: errorsProfile },
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      baseLocation: user?.volunteerProfile?.baseLocation || '',
      bio: user?.volunteerProfile?.bio || '',
      skills: user?.volunteerProfile?.skills?.join(', ') || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { isSubmitting: isSubmittingPassword, errors: errorsPassword },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmitProfile = async (data) => {
    try {
      setError(null);
      setSuccess(null);

      // Actualizar perfil de usuario
      await api.updateUserProfile({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
      });

      // Si es voluntario, actualizar perfil de voluntario
      if (user?.role === 'VOLUNTEER') {
        const skills = data.skills
          ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        await api.updateVolunteerProfile({
          baseLocation: data.baseLocation,
          bio: data.bio,
          skills,
        });
      }

      await fetchCurrentUser();
      setSuccess('✅ Perfil actualizado correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setError(null);
      setSuccess(null);

      if (data.newPassword !== data.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }

      await api.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      resetPassword();
      setSuccess('✅ Contraseña cambiada correctamente');
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 5MB');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setAvatarPreview(URL.createObjectURL(file));

      await api.uploadAvatar(file);
      await fetchCurrentUser();
      setSuccess('✅ Avatar actualizado correctamente');
    } catch (err) {
      setError(err.message || 'Error al subir el avatar');
      setAvatarPreview(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="👤 Mi Perfil"
        description="Gestiona tu información personal, contraseña y preferencias"
      />

      {/* Messages */}
      {error && (
        <ErrorAlert message={error} />
      )}
      {success && (
        <div className="rounded-xl border-2 border-green-400 bg-green-50 p-4 text-sm text-green-700 animate-slide-down">
          {success}
        </div>
      )}

      {/* Avatar Section */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-3xl shadow-xl ring-4 ring-white overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                user?.fullName?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-white shadow-lg hover:bg-primary-dark transition-colors">
              <PhotoIcon className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-ink">{user?.fullName}</h2>
            <p className="text-sm text-muted">{user?.email}</p>
            <span className="inline-flex mt-2 items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {user?.role === 'VOLUNTEER' && '🎯 Voluntario'}
              {user?.role === 'ORGANIZATION' && '🏢 Organización'}
              {user?.role === 'ADMIN' && '👑 Administrador'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`
            flex items-center gap-2 px-6 py-3 font-semibold transition-all
            ${activeTab === 'profile'
              ? 'border-b-2 border-primary text-primary -mb-[2px]'
              : 'text-muted hover:text-ink'
            }
          `}
        >
          <UserCircleIcon className="h-5 w-5" />
          Información Personal
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`
            flex items-center gap-2 px-6 py-3 font-semibold transition-all
            ${activeTab === 'password'
              ? 'border-b-2 border-primary text-primary -mb-[2px]'
              : 'text-muted hover:text-ink'
            }
          `}
        >
          <LockClosedIcon className="h-5 w-5" />
          Cambiar Contraseña
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg animate-slide-up">
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-5">
            {/* Nombre Completo */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...registerProfile('fullName', { required: 'El nombre es requerido' })}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errorsProfile.fullName && (
                <p className="text-sm text-red-600 mt-1">{errorsProfile.fullName.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted mt-1">El correo no se puede cambiar</p>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  {...registerProfile('phoneNumber')}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+591 70000000"
                />
              </div>
            </div>

            {user?.role === 'VOLUNTEER' && (
              <>
                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Ubicación Base
                  </label>
                  <input
                    type="text"
                    {...registerProfile('baseLocation')}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Santa Cruz de la Sierra"
                  />
                </div>

                {/* Biografía */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Biografía
                  </label>
                  <textarea
                    {...registerProfile('bio')}
                    rows={4}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Cuéntanos sobre ti, tu experiencia en voluntariado..."
                  />
                </div>

                {/* Habilidades */}
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Habilidades
                  </label>
                  <input
                    type="text"
                    {...registerProfile('skills')}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Primeros auxilios, Logística, Coordinación"
                  />
                  <p className="text-xs text-muted mt-1">Separa las habilidades con comas</p>
                </div>
              </>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
            >
              {isSubmittingProfile ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"></span>
                  Guardando...
                </>
              ) : (
                <>💾 Guardar Cambios</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg animate-slide-up">
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-5">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Contraseña Actual <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...registerPassword('currentPassword', { required: 'Requerido' })}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
              {errorsPassword.currentPassword && (
                <p className="text-sm text-red-600 mt-1">{errorsPassword.currentPassword.message}</p>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...registerPassword('newPassword', {
                  required: 'Requerido',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
              {errorsPassword.newPassword && (
                <p className="text-sm text-red-600 mt-1">{errorsPassword.newPassword.message}</p>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Confirmar Nueva Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...registerPassword('confirmPassword', {
                  required: 'Requerido',
                  validate: (value) => value === newPassword || 'Las contraseñas no coinciden',
                })}
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
              {errorsPassword.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errorsPassword.confirmPassword.message}</p>
              )}
            </div>

            {/* Info */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                🔒 Requisitos de seguridad:
              </p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                <li>Mínimo 8 caracteres</li>
                <li>Se recomienda usar mayúsculas, minúsculas, números y símbolos</li>
              </ul>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
            >
              {isSubmittingPassword ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2"></span>
                  Cambiando...
                </>
              ) : (
                <>🔑 Cambiar Contraseña</>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

