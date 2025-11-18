'use strict';

import { NavLink } from 'react-router-dom';
import {
  ChartBarIcon,
  CommandLineIcon,
  HomeIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import useAuth from '../hooks/useAuth.js';

const linksByRole = {
  VOLUNTEER: [
    { to: '/dashboard', label: 'Inicio', icon: HomeIcon },
    { to: '/dashboard/tasks', label: 'Mis tareas', icon: CommandLineIcon },
    { to: '/dashboard/gamification', label: 'Gamificación', icon: PuzzlePieceIcon },
  ],
  ORGANIZATION: [
    { to: '/dashboard', label: 'Panel', icon: HomeIcon },
    { to: '/dashboard/tasks', label: 'Tareas', icon: CommandLineIcon },
    { to: '/dashboard/matching', label: 'Asignación IA', icon: UsersIcon },
    { to: '/dashboard/reports', label: 'Reportes', icon: ChartBarIcon },
    { to: '/dashboard/volunteers', label: 'Voluntarios', icon: UserGroupIcon },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Overview', icon: HomeIcon },
    { to: '/dashboard/reports', label: 'Reportes', icon: ChartBarIcon },
    { to: '/dashboard/volunteers', label: 'Voluntarios', icon: UserGroupIcon },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role ?? 'VOLUNTEER';
  const links = linksByRole[role] ?? linksByRole.VOLUNTEER;

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">La Causa</p>
          <p className="text-lg font-semibold text-ink">Panel Inteligente</p>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted hover:bg-slate-100 hover:text-ink',
                  ].join(' ')
                }
              >
                <IconComponent className="h-5 w-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;


