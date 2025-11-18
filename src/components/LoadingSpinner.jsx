'use strict';

const LoadingSpinner = ({ label = 'Cargando...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export default LoadingSpinner;



