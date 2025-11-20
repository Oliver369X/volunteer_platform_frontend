'use strict';

import { useState, useRef } from 'react';
import { 
  PhotoIcon, 
  DocumentIcon, 
  XMarkIcon,
  ArrowUpTrayIcon 
} from '@heroicons/react/24/outline';

const FileUpload = ({ 
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  value = null,
  onChange,
  label = 'Subir archivo',
  preview = true,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (maxSize && file.size > maxSize) {
      return `El archivo es muy grande. Máximo ${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
    }
    
    if (accept && accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExt = `.${file.name.split('.').pop()}`;
      
      const isValid = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', ''));
        }
        return type === fileType || type === fileExt;
      });
      
      if (!isValid) {
        return 'Tipo de archivo no permitido';
      }
    }
    
    return null;
  };

  const handleFiles = (files) => {
    const file = files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onChange?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isImage = value && value.type?.startsWith('image/');
  const previewUrl = value && isImage ? URL.createObjectURL(value) : null;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-ink">{label}</label>
      )}
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed
          p-6 transition-all cursor-pointer
          ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-slate-300 bg-white hover:border-primary hover:bg-slate-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-400 bg-red-50' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {value && preview ? (
          <div className="relative w-full">
            {isImage && previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 w-full object-contain rounded-xl"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-2 text-white shadow-lg hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <DocumentIcon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink truncate max-w-[200px]">
                      {value.name}
                    </p>
                    <p className="text-xs text-muted">
                      {(value.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemove}
                  className="rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              {accept.includes('image') ? (
                <PhotoIcon className="h-8 w-8 text-primary" />
              ) : (
                <DocumentIcon className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink mb-1">
                {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic'}
              </p>
              <p className="text-xs text-muted">
                {accept === 'image/*' ? 'Imágenes' : 'Archivos'} hasta{' '}
                {(maxSize / (1024 * 1024)).toFixed(0)}MB
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span className="text-sm font-semibold">Seleccionar archivo</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm font-semibold text-red-600 animate-slide-down">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;

