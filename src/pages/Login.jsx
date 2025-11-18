'use strict';

import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import InputField from '../components/InputField.jsx';
import useAuth from '../hooks/useAuth.js';
import ErrorAlert from '../components/ErrorAlert.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

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
    return <LoadingSpinner label="Cargando tu panel..." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">La Causa</p>
          <h1 className="text-2xl font-semibold text-ink">Bienvenido de nuevo</h1>
          <p className="text-sm text-muted">
            Ingresa tus credenciales para acceder al ecosistema inteligente de voluntarios.
          </p>
        </div>
        {serverError ? <ErrorAlert message={serverError} /> : null}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
          <InputField
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            required
            register={register}
            name="email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Debes ingresar un correo',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Correo inválido',
              },
            })}
          />
          <InputField
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            required
            name="password"
            register={register}
            error={errors.password?.message}
            {...register('password', {
              required: 'Ingresa tu contraseña',
            })}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <div className="mt-6 space-y-2 text-center text-sm text-muted">
          <p>
            ¿Primera vez aquí?{' '}
            <Link className="font-semibold text-primary hover:underline" to="/auth/register/volunteer">
              Quiero ser voluntario
            </Link>
          </p>
          <p>
            ¿Representas una organización?
            <Link className="ml-1 font-semibold text-primary hover:underline" to="/auth/register/organization">
              Crear cuenta institucional
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;



