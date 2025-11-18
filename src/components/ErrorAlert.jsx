'use strict';

import { XCircleIcon } from '@heroicons/react/24/outline';

const ErrorAlert = ({ title = 'Algo salió mal', message }) => (
  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
    <XCircleIcon className="h-6 w-6 flex-shrink-0" />
    <div>
      <p className="font-semibold">{title}</p>
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
    </div>
  </div>
);

export default ErrorAlert;



