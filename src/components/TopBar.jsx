'use strict';

import { Bars3Icon } from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth.js';

const TopBar = ({ onToggleSidebar }) => {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-lg border border-slate-200 bg-white p-2 text-muted shadow-sm"
        aria-label="Abrir menú"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>
      <div className="text-sm font-semibold text-ink">La Causa</div>
      <button
        type="button"
        onClick={logout}
        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
      >
        Salir
      </button>
    </header>
  );
};

export default TopBar;


