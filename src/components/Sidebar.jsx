'use strict';

import { NavLink } from 'react-router-dom';
import {
  ChartBarIcon,
  CommandLineIcon,
  HomeIcon,
  PuzzlePieceIcon,
  SparklesIcon,
  UserGroupIcon,
  UsersIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth.js';

const linksByRole = {
  VOLUNTEER: [
    { to: '/dashboard', label: 'Inicio', icon: HomeIcon, badge: null },
    { to: '/dashboard/assignments', label: 'Mis Asignaciones', icon: CommandLineIcon, badge: '📋' },
    { to: '/dashboard/tasks', label: 'Tareas Disponibles', icon: CommandLineIcon, badge: null },
    { to: '/dashboard/gamification', label: 'Gamificación', icon: PuzzlePieceIcon, badge: '🎮' },
    { to: '/dashboard/badges', label: 'Mis Badges NFT', icon: SparklesIcon, badge: '🏆' },
  ],
  ORGANIZATION: [
    { to: '/dashboard', label: 'Panel', icon: HomeIcon, badge: null },
    { to: '/dashboard/tasks', label: 'Tareas', icon: CommandLineIcon, badge: null },
    { to: '/dashboard/calendar', label: 'Calendario', icon: CalendarDaysIcon, badge: '📅' },
    { to: '/dashboard/matching', label: 'Asignación IA', icon: UsersIcon, badge: '🤖' },
    { to: '/dashboard/reports', label: 'Reportes', icon: ChartBarIcon, badge: '📊' },
    { to: '/dashboard/volunteers', label: 'Voluntarios', icon: UserGroupIcon, badge: null },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Overview', icon: HomeIcon, badge: null },
    { to: '/dashboard/reports', label: 'Reportes', icon: ChartBarIcon, badge: '📊' },
    { to: '/dashboard/volunteers', label: 'Voluntarios', icon: UserGroupIcon, badge: null },
  ],
};

const Sidebar = ({ onNavigate }) => {
  const { user } = useAuth();
  const role = user?.role ?? 'VOLUNTEER';
  const links = linksByRole[role] ?? linksByRole.VOLUNTEER;

  return (
    <aside className="hidden w-64 xl:w-72 flex-shrink-0 lg:block">
      <div className="sticky top-6 flex flex-col gap-6 rounded-2xl border-2 border-slate-200 bg-white/90 backdrop-blur-sm p-5 shadow-xl">
        {/* Logo/Header */}
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
              <span className="text-xl">🌟</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                La Causa
              </p>
              <p className="text-base font-bold text-ink">Panel Inteligente</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/dashboard'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg scale-105'
                      : 'text-muted hover:bg-slate-100 hover:text-ink hover:scale-102',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Indicador activo */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-full" />
                    )}
                    
                    {/* Ícono */}
                    <div className={`
                      flex items-center justify-center h-8 w-8 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-white/20' 
                        : 'bg-slate-100 group-hover:bg-slate-200'
                      }
                    `}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    {/* Label */}
                    <span className="flex-1">{link.label}</span>
                    
                    {/* Badge/Emoji opcional */}
                    {link.badge && (
                      <span className="text-base">{link.badge}</span>
                    )}

                    {/* Efecto de brillo en hover */}
                    {!isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-200 mt-auto">
          <NavLink
            to="/dashboard/profile"
            end
            onClick={onNavigate}
            className="block rounded-xl bg-gradient-to-br from-blue-50 to-emerald-50 p-3 transition-all hover:from-blue-100 hover:to-emerald-100 button-hover"
          >
            <p className="text-xs font-semibold text-ink mb-1">
              {user?.fullName || 'Usuario'}
            </p>
            <p className="text-[10px] text-muted">
              {role === 'VOLUNTEER' && 'Voluntario activo'}
              {role === 'ORGANIZATION' && 'Organización verificada'}
              {role === 'ADMIN' && 'Administrador del sistema'}
            </p>
            <p className="text-[10px] text-primary mt-1 font-semibold">
              👤 Ver perfil →
            </p>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


