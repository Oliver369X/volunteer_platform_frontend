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
    bio: z.string().min(10, 'La biografía debe tener al menos 10 caracteres').max(300, 'Máximo 300 caracteres'),
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 gradient-mesh px-4 py-8 sm:py-12 animate-fade-in">
      {/* Efectos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="rounded-3xl border-2 border-slate-200 bg-white/95 backdrop-blur-xl p-6 sm:p-10 shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl">
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
              Únete a La Causa
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-3">
              Registro de voluntario/a 💚
            </h1>
            <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
              Completa tus datos para acceder a misiones, recompensas NFT y el ecosistema de ayuda inteligente con IA.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  step === 1 ? 'w-12 bg-emerald-500' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {serverError && (
            <div className="mb-6 animate-slide-down">
              <ErrorAlert message={serverError} />
            </div>
          )}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <InputField
            label="Nombre completo"
            placeholder="Ingresa tu nombre completo"
            required
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <InputField
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            required
            {...register('email')}
            error={errors.email?.message}
          />
          <InputField
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
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
            <span className="text-sm font-medium text-ink">
              Biografía<span className="ml-1 text-primary">*</span>
            </span>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Cuéntanos un poco sobre tu experiencia en voluntariado y habilidades."
              {...register('bio')}
            />
            {errors.bio?.message ? (
              <span className="text-xs text-red-600">{errors.bio.message}</span>
            ) : (
              <span className="text-xs text-muted">Mínimo 10 caracteres, máximo 300</span>
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



