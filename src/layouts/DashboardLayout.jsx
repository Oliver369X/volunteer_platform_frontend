'use strict';

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import useAuth from '../hooks/useAuth.js';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 lg:px-8">
        {sidebarOpen ? (
          <div className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden">
            <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
              <Sidebar />
            </div>
            <div
              className="absolute inset-0"
              onClick={() => setSidebarOpen(false)}
              role="presentation"
            />
          </div>
        ) : null}
        <Sidebar />
        <main className="flex-1">
          <div className="mb-6 hidden items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:flex">
            <div>
              <p className="text-sm font-semibold text-ink">
                ¡Hola, {user?.fullName ?? 'voluntario/a'}!
              </p>
              <p className="text-xs text-muted">Rol: {user?.role ?? 'VOLUNTEER'}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
            >
              Cerrar sesión
            </button>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;



