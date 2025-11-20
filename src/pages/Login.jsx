'use strict';

import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import InputField from '../components/InputField.jsx';
import useAuth from '../hooks/useAuth.js';
import ErrorAlert from '../components/ErrorAlert.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { 
  EnvelopeIcon, 
  LockClosedIcon,
  SparklesIcon,
  UserGroupIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';

const Login = () => {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setServerError(null);
      await login(values);
      const redirect = searchParams.get('redirect') ?? '/dashboard';
      navigate(redirect, { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return <LoadingSpinner label="Cargando tu panel..." fullPage={true} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-8 sm:py-12 gradient-mesh animate-fade-in">
      {/* Efectos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card principal */}
        <div className="rounded-3xl border-2 border-slate-200 bg-white/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl animate-scale-in">
          {/* Logo y header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark shadow-xl">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              La Causa
            </p>
            <h1 className="text-3xl font-bold text-ink mb-2">
              ¡Bienvenido de nuevo! 👋
            </h1>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Ingresa tus credenciales para acceder al ecosistema inteligente de voluntarios.
            </p>
          </div>

          {/* Error alert */}
          {serverError && (
            <div className="mb-6 animate-slide-down">
              <ErrorAlert message={serverError} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <EnvelopeIcon className="h-5 w-5" />
                </div>
                <InputField
                  label="Correo electrónico"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  error={errors.email?.message}
                  className="pl-10"
                  {...register('email', {
                    required: 'Debes ingresar un correo',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Correo inválido',
                    },
                  })}
                />
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
                <InputField
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  required
                  error={errors.password?.message}
                  className="pl-10"
                  {...register('password', {
                    required: 'Ingresa tu contraseña',
                  })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 button-hover"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Ingresando...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Ingresar al panel
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-muted">¿Primera vez?</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Opciones de registro */}
          <div className="space-y-3">
            <Link
              to="/auth/register/volunteer"
              className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink transition-all hover:border-primary hover:bg-primary/5 hover:scale-102 button-hover"
            >
              <UserGroupIcon className="h-5 w-5 text-primary" />
              Quiero ser voluntario
            </Link>

            <Link
              to="/auth/register/organization"
              className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:scale-102 button-hover"
            >
              <BuildingOfficeIcon className="h-5 w-5 text-emerald-600" />
              Crear cuenta institucional
            </Link>
          </div>

          {/* Footer info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted">
              Sistema seguro con blockchain y NFTs 🔐
            </p>
          </div>
        </div>

        {/* Features cards */}
        <div className="mt-6 grid grid-cols-3 gap-3 px-2">
          {[
            { icon: '🤖', label: 'IA' },
            { icon: '🏆', label: 'NFTs' },
            { icon: '⚡', label: 'Rápido' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 text-center shadow-md animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="text-2xl mb-1">{feature.icon}</div>
              <div className="text-xs font-semibold text-muted">{feature.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;



