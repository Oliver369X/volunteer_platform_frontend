'use strict';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

const CreateBadgeModal = ({ isOpen, onClose, onBadgeCreated, api }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      category: '',
      level: 'BRONCE',
    },
  });

  const level = watch('level');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const iconFile = document.querySelector('input[type="file"]')?.files?.[0];
      
      const result = await api.createBadge(data, iconFile);
      
      reset();
      setIconPreview(null);
      onBadgeCreated(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al crear el badge');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setIconPreview(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl m-4 animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-slate-200 bg-gradient-to-r from-primary/10 to-emerald/10 px-6 py-4">
          <h2 className="text-2xl font-bold text-ink">✨ Crear Badge NFT</h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* Icon Upload */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              🖼️ Imagen del Badge (Opcional)
            </label>
            <div className="mt-2">
              {iconPreview ? (
                <div className="relative">
                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border-2 border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIconPreview(null);
                      document.querySelector('input[type="file"]').value = '';
                    }}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <PhotoIcon className="h-12 w-12 text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">
                    Haz clic para subir una imagen
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG hasta 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              🔑 Código del Badge <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code', {
                required: 'El código es requerido',
                pattern: {
                  value: /^[A-Z0-9_]+$/,
                  message: 'Solo mayúsculas, números y guiones bajos',
                },
              })}
              placeholder="HERO_BADGE"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              📛 Nombre del Badge <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es requerido' })}
              placeholder="Héroe Humanitario"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              📝 Descripción
            </label>
            <textarea
              {...register('description')}
              placeholder="Otorgado por completar 10 misiones críticas"
              rows={3}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              🏷️ Categoría
            </label>
            <input
              type="text"
              {...register('category')}
              placeholder="Achievement, Milestone, Speed..."
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-semibold text-ink mb-2">
              ⭐ Nivel del Badge
            </label>
            <select
              {...register('level')}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="BRONCE">🥉 Bronce</option>
              <option value="PLATA">🥈 Plata</option>
              <option value="ORO">🥇 Oro</option>
              <option value="PLATINO">💎 Platino</option>
              <option value="ESPECIAL">✨ Especial</option>
            </select>
            <p className="mt-2 text-xs text-muted">
              Nivel actual: <span className="font-semibold">{level}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : '✨ Crear Badge NFT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBadgeModal;

