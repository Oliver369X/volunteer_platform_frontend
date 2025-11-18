'use strict';

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import InputField from '../components/InputField.jsx';
import useAuth from '../hooks/useAuth.js';
import ErrorAlert from '../components/ErrorAlert.jsx';

const schema = z
  .object({
    fullName: z.string().min(3, 'Ingresa tu nombre completo'),
    email: z.string().email('Correo inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    phoneNumber: z.string().optional(),
    baseLocation: z.string().optional(),
    bio: z.string().max(300).optional(),
    skills: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.skills && values.skills.split(',').length > 20) {
      ctx.addIssue({
        path: ['skills'],
        code: 'custom',
        message: 'Máximo 20 habilidades separadas por coma',
      });
    }
  });

const RegisterVolunteer = () => {
  const { registerVolunteer } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      baseLocation: '',
      bio: '',
      skills: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      setServerError(null);
      const payload = {
        ...values,
        skills: values.skills
          ? values.skills
              .split(',')
              .map((skill) => skill.trim())
              .filter(Boolean)
          : undefined,
      };
      await registerVolunteer(payload);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.message ?? 'No fue posible completar el registro');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Únete a La Causa</p>
          <h1 className="text-2xl font-semibold text-ink">Registro de voluntario/a</h1>
          <p className="text-sm text-muted">
            Completa tus datos para acceder a misiones, recompensas y el ecosistema de ayuda inteligente.
          </p>
        </div>
        {serverError ? <ErrorAlert message={serverError} /> : null}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <InputField
            label="Nombre completo"
            required
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <InputField
            label="Correo electrónico"
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
            label="Teléfono"
            type="tel"
            placeholder="+591 70000000"
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
          />
          <InputField
            label="Ciudad base"
            placeholder="Santa Cruz de la Sierra"
            {...register('baseLocation')}
            error={errors.baseLocation?.message}
          />
          <InputField
            label="Habilidades (separadas por coma)"
            placeholder="Primeros auxilios, Logística, Coordinación"
            {...register('skills')}
            error={errors.skills?.message}
            className="md:col-span-2"
          />
          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">Biografía</span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Cuéntanos un poco sobre tu experiencia en voluntariado y habilidades."
              {...register('bio')}
            />
            {errors.bio?.message ? (
              <span className="text-xs text-red-600">{errors.bio.message}</span>
            ) : (
              <span className="text-xs text-muted">Máximo 300 caracteres</span>
            )}
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {isSubmitting ? 'Registrando...' : 'Crear mi cuenta solidaria'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tienes una cuenta?{' '}
          <Link className="font-semibold text-primary hover:underline" to="/auth/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterVolunteer;



