'use strict';

const LoadingSpinner = ({ label = 'Cargando...', fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-muted animate-fade-in">
      {/* Spinner con efecto de pulso */}
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-primary border-t-transparent`} />
        <div className={`absolute inset-0 ${sizeClasses[size]} animate-ping rounded-full border-primary/30 border-t-transparent`} />
      </div>
      
      {/* Label con animación */}
      <div className="text-center">
        <p className="text-sm font-semibold text-ink animate-pulse">{label}</p>
        <div className="mt-2 flex gap-1 justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 gradient-mesh">
        <div className="rounded-3xl border-2 border-slate-200 bg-white/90 backdrop-blur-sm p-12 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
};

export default LoadingSpinner;



