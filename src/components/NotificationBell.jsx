'use strict';

import { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDateTime } from '../lib/formatters.js';

// Mock de notificaciones - En el futuro vendrá del backend
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'ASSIGNMENT',
    title: 'Nueva asignación',
    message: 'Te han asignado a la misión "Distribución de alimentos"',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'TASK_COMPLETED',
    title: 'Tarea completada',
    message: 'Un voluntario ha marcado como completada una de tus tareas',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const NotificationBell = ({ useApi }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef(null);
  const api = useApi?.();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    // api?.markNotificationAsRead(notificationId); // TODO: Implementar en backend
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ASSIGNMENT':
        return '📋';
      case 'TASK_COMPLETED':
        return '✅';
      case 'BADGE_EARNED':
        return '🏆';
      case 'POINTS_AWARDED':
        return '⭐';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border-2 border-slate-200 bg-white p-2 text-muted transition-all hover:border-primary hover:text-primary hover:scale-110 button-hover"
        aria-label="Notificaciones"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[32rem] overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-2xl animate-slide-down z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-200 bg-gradient-to-r from-primary/10 to-emerald/10 p-4">
            <h3 className="text-lg font-bold text-ink">🔔 Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BellIcon className="h-12 w-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-ink">No tienes notificaciones</p>
                <p className="text-xs text-muted mt-1">
                  Te avisaremos cuando haya algo nuevo
                </p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      border-b border-slate-200 p-4 transition-all hover:bg-slate-50 cursor-pointer
                      ${!notification.read ? 'bg-primary/5' : ''}
                    `}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-ink line-clamp-1">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted mt-2">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t-2 border-slate-200 bg-slate-50 p-3">
              <button
                onClick={handleClearAll}
                className="w-full text-sm font-semibold text-red-600 hover:underline"
              >
                🗑️ Limpiar todas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

