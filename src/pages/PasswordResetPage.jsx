import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/InputField';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [step, setStep] = useState(token ? 'reset' : 'request'); // 'request' | 'reset' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm({
    defaultValues: { email: '' },
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
    watch,
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const newPassword = watch('password');

  const onSubmitRequest = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/auth/password/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al solicitar recuperación');
      }

      setSuccess('Se ha enviado un enlace de recuperación a tu correo electrónico');
      setStep('success');
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación de contraseña');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitReset = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al restablecer contraseña');
      }

      setSuccess('Contraseña restablecida exitosamente. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Procesando..." fullPage={true} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-slate-200">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <LockClosedIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 'request' && 'Recuperar Contraseña'}
              {step === 'reset' && 'Restablecer Contraseña'}
              {step === 'success' && 'Correo Enviado'}
            </h1>
            <p className="text-gray-600 mt-2">
              {step === 'request' && 'Ingresa tu correo para recibir un enlace de recuperación'}
              {step === 'reset' && 'Ingresa tu nueva contraseña'}
              {step === 'success' && 'Revisa tu correo electrónico para continuar'}
            </p>
          </div>

          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Step 1: Request Reset */}
          {step === 'request' && (
            <form onSubmit={handleSubmitRequest(onSubmitRequest)} className="space-y-4">
              <InputField
                label="Correo Electrónico"
                type="email"
                icon={EnvelopeIcon}
                {...registerRequest('email', {
                  required: 'El correo es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Correo inválido',
                  },
                })}
                error={errorsRequest.email?.message}
                placeholder="tu@correo.com"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Enviar Enlace de Recuperación
              </button>

              <div className="text-center">
                <Link to="/auth/login" className="text-sm text-blue-600 hover:text-blue-700">
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Reset Password */}
          {step === 'reset' && (
            <form onSubmit={handleSubmitReset(onSubmitReset)} className="space-y-4">
              <InputField
                label="Nueva Contraseña"
                type="password"
                icon={LockClosedIcon}
                {...registerReset('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 8,
                    message: 'La contraseña debe tener al menos 8 caracteres',
                  },
                })}
                error={errorsReset.password?.message}
                placeholder="••••••••"
              />

              <InputField
                label="Confirmar Contraseña"
                type="password"
                icon={LockClosedIcon}
                {...registerReset('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: (value) => value === newPassword || 'Las contraseñas no coinciden',
                })}
                error={errorsReset.confirmPassword?.message}
                placeholder="••••••••"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Restablecer Contraseña
              </button>

              <div className="text-center">
                <Link to="/auth/login" className="text-sm text-blue-600 hover:text-blue-700">
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="text-6xl">📧</div>
              <p className="text-gray-600">
                Hemos enviado un enlace de recuperación a tu correo electrónico.
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              <Link
                to="/auth/login"
                className="inline-block text-blue-600 hover:text-blue-700 font-semibold"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;

