'use strict';

import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth.js';
import useApi from '../hooks/useApi.js';
import NotificationBell from './NotificationBell.jsx';

const TopBar = ({ onToggleSidebar }) => {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-3 shadow-lg lg:hidden animate-slide-down">
      {/* Botón de menú */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-2.5 text-muted shadow-md transition-all hover:border-primary hover:text-primary hover:scale-105 active:scale-95"
        aria-label="Abrir menú"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Logo/Marca central */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
          <span className="text-base">🌟</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wide text-primary leading-none">
            La Causa
          </span>
          <span className="text-[10px] text-muted hidden sm:block">
            {user?.fullName?.split(' ')[0] || 'Usuario'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notificaciones */}
        <NotificationBell useApi={useApi} />
        
        {/* Botón de logout */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-primary shadow-md transition-all hover:border-primary hover:bg-primary hover:text-white active:scale-95"
          aria-label="Cerrar sesión"
        >
          <span className="hidden sm:inline">Salir</span>
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;


