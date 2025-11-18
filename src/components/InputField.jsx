'use strict';

import clsx from 'clsx';

const InputField = ({
  label,
  name,
  register,
  type = 'text',
  placeholder,
  error,
  hint,
  required,
  trailing,
  leading,
  className,
  ...rest
}) => {
  const hasError = Boolean(error);
  return (
    <label className={clsx('flex w-full flex-col gap-1', className)}>
      {label ? (
        <span className="text-sm font-medium text-ink">
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </span>
      ) : null}
      <div
        className={clsx(
          'flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm transition',
          hasError
            ? 'border-red-400 focus-within:border-red-500 focus-within:ring-red-200'
            : 'border-slate-200 focus-within:border-primary focus-within:ring-primary/20',
        )}
      >
        {leading ? <span className="text-muted">{leading}</span> : null}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          className="w-full border-none bg-transparent text-sm outline-none focus:ring-0"
          {...(register ? register(name) : {})}
          {...rest}
        />
        {trailing ? <span className="text-muted">{trailing}</span> : null}
      </div>
      {hasError ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
};

export default InputField;



