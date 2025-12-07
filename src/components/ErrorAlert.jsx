'use strict';

import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ErrorAlert = ({ title = 'Algo salió mal', message, details, onClose }) => (
  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 relative">
    <XCircleIcon className="h-6 w-6 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold">{title}</p>
      {message && <p className="text-sm text-red-600 mt-1">{message}</p>}
      {details && Array.isArray(details) && details.length > 0 && (
        <ul className="mt-2 list-disc list-inside text-sm text-red-600">
          {details.map((detail, idx) => (
            <li key={idx}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
    {onClose && (
      <button
        onClick={onClose}
        className="flex-shrink-0 text-red-600 hover:text-red-800"
        aria-label="Cerrar"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    )}
  </div>
);

export default ErrorAlert;



