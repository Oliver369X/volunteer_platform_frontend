'use strict';

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import useAuth from '../hooks/useAuth.js';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar al cambiar de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevenir scroll cuando el sidebar móvil está abierto
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <TopBar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      
      <div className="mx-auto flex w-full max-w-[1920px] gap-6 px-2 sm:px-4 py-4 lg:px-8 lg:py-6">
        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            role="presentation"
          >
            {/* Sidebar móvil */}
            <div 
              className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-slide-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    La Causa
                  </p>
                  <p className="text-lg font-bold text-ink">Panel Inteligente</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-2 text-muted hover:bg-slate-100 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <Sidebar onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
        
        {/* Sidebar desktop */}
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Header de bienvenida (desktop) */}
          <div className="mb-4 lg:mb-6 hidden lg:flex items-center justify-between rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-4 shadow-lg animate-slide-down">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">
                  ¡Hola, {user?.fullName ?? 'voluntario/a'}! 👋
                </p>
                <p className="text-xs text-muted flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Rol: <span className="font-semibold">{user?.role ?? 'VOLUNTEER'}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary hover:text-white button-hover shadow-sm"
            >
              Cerrar sesión
            </button>
          </div>
          
          {/* Contenido de las páginas */}
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;



