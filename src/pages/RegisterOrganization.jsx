'use strict';

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import InputField from '../components/InputField.jsx';
import useAuth from '../hooks/useAuth.js';
import ErrorAlert from '../components/ErrorAlert.jsx';

const schema = z.object({
  fullName: z.string().min(3, 'Ingresa tu nombre'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  phoneNumber: z.string().min(6, 'Ingresa un teléfono válido'),
  organization: z.object({
    name: z.string().min(3, 'Ingresa el nombre de la organización'),
    description: z.string().optional(),
    sector: z.string().optional(),
    headquartersLocation: z.string().optional(),
    coverageAreas: z.string().optional(),
  }),
});

const RegisterOrganization = () => {
  const { registerOrganization } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      setServerError(null);
      const coverageAreas = values.organization.coverageAreas
        ? values.organization.coverageAreas
            .split(',')
            .map((area) => area.trim())
            .filter(Boolean)
        : undefined;
      await registerOrganization({
        ...values,
        organization: {
          ...values.organization,
          coverageAreas,
        },
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.message ?? 'No fue posible registrar la organización');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Plataforma La Causa
          </p>
          <h1 className="text-2xl font-semibold text-ink">Registro de organización</h1>
          <p className="text-sm text-muted">
            Optimiza tu gestión de voluntarios con asignación inteligente, métricas y transparencia.
          </p>
        </div>
        {serverError ? <ErrorAlert message={serverError} /> : null}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <InputField
            label="Nombre completo del representante"
            required
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <InputField
            label="Correo del representante"
            type="email"
            required
            {...register('email')}
            error={errors.email?.message}
          />
          <InputField
            label="Contraseña"
            type="password"
            required
            {...register('password')}
            error={errors.password?.message}
          />
          <InputField
            label="Teléfono de contacto"
            placeholder="+591 70000000"
            required
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />
          <InputField
            label="Nombre de la organización"
            required
            {...register('organization.name')}
            error={errors.organization?.name?.message}
          />
          <InputField
            label="Sector (ej. Humanitario, Salud, Educación)"
            {...register('organization.sector')}
            error={errors.organization?.sector?.message}
          />
          <InputField
            label="Sede principal"
            placeholder="Santa Cruz de la Sierra"
            {...register('organization.headquartersLocation')}
            error={errors.organization?.headquartersLocation?.message}
          />
          <InputField
            label="Cobertura (separado por coma)"
            placeholder="Santa Cruz, Beni, Pando"
            {...register('organization.coverageAreas')}
            error={errors.organization?.coverageAreas?.message}
          />
          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">
              Descripción de la organización (opcional)
            </span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Describe brevemente tu misión, tipo de eventos que coordinan o áreas de enfoque."
              {...register('organization.description')}
            />
            {errors.organization?.description?.message ? (
              <span className="text-xs text-red-600">
                {errors.organization.description.message}
              </span>
            ) : (
              <span className="text-xs text-muted">Esto ayuda al algoritmo a priorizar tus misiones.</span>
            )}
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {isSubmitting ? 'Registrando organización...' : 'Crear cuenta institucional'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tienes una cuenta?
          <Link className="ml-1 font-semibold text-primary hover:underline" to="/auth/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterOrganization;



