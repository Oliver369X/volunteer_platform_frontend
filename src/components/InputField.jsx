'use strict';

import clsx from 'clsx';
import { forwardRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const InputField = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  hint,
  required,
  trailing,
  leading,
  className,
  ...rest
}, ref) => {
  const hasError = Boolean(error);
  
  return (
    <label className={clsx('flex w-full flex-col gap-2', className)}>
      {label && (
        <span className="text-sm font-semibold text-ink flex items-center gap-1">
          {label}
          {required && (
            <span className="text-primary text-base">*</span>
          )}
        </span>
      )}
      
      <div className="relative group">
        <div
          className={clsx(
            'flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-3 shadow-sm transition-all',
            'group-hover:shadow-md',
            hasError
              ? 'border-red-400 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100'
              : 'border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10',
          )}
        >
          {leading && (
            <span className={clsx(
              'text-muted transition-colors',
              'group-focus-within:text-primary'
            )}>
              {leading}
            </span>
          )}
          
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            className={clsx(
              'w-full border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted/60',
              'focus:ring-0'
            )}
            ref={ref}
            {...rest}
          />
          
          {trailing && !hasError && (
            <span className="text-muted transition-colors group-focus-within:text-primary">
              {trailing}
            </span>
          )}
          
          {hasError && (
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
        </div>

        {/* Línea decorativa inferior animada */}
        <div 
          className={clsx(
            'absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300',
            'group-focus-within:w-full',
            hasError ? 'bg-red-500' : 'bg-primary'
          )}
        />
      </div>

      {hasError ? (
        <div className="flex items-start gap-1.5 animate-slide-down">
          <span className="text-xs font-semibold text-red-600 leading-tight">
            {error}
          </span>
        </div>
      ) : hint ? (
        <span className="text-xs text-muted leading-tight">{hint}</span>
      ) : null}
    </label>
  );
});

InputField.displayName = 'InputField';

export default InputField;



