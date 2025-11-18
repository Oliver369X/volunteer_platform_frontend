'use strict';

import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import LoadingSpinner from './LoadingSpinner.jsx';

const ProtectedRoute = ({ allowedRoles }) => {
  const { status, user } = useAuth();

  if (status === 'loading' || status === 'idle') {
    return <LoadingSpinner label="Validando sesión..." />;
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;



