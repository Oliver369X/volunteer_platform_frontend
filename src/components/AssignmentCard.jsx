'use strict';

import { useState } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { formatDateTime } from '../lib/formatters.js';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pendiente',
    color: 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: ClockIcon,
  },
  ACCEPTED: {
    label: 'Aceptada',
    color: 'border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    icon: CheckCircleIcon,
  },
  IN_PROGRESS: {
    label: 'En Progreso',
    color: 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100',
    badge: 'bg-indigo-100 text-indigo-700',
    icon: FireIcon,
  },
  COMPLETED: {
    label: 'Completada',
    color: 'border-green-400 bg-gradient-to-br from-green-50 to-green-100',
    badge: 'bg-green-100 text-green-700',
    icon: CheckCircleIcon,
  },
  VERIFIED: {
    label: 'Verificada',
    color: 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircleIcon,
  },
  REJECTED: {
    label: 'Rechazada',
    color: 'border-red-400 bg-gradient-to-br from-red-50 to-red-100',
    badge: 'bg-red-100 text-red-700',
    icon: XCircleIcon,
  },
};

const URGENCY_CONFIG = {
  LOW: { label: 'Baja', color: 'text-green-600', emoji: '⚪' },
  MEDIUM: { label: 'Media', color: 'text-yellow-600', emoji: '🟡' },
  HIGH: { label: 'Alta', color: 'text-orange-600', emoji: '🟠' },
  CRITICAL: { label: 'Crítica', color: 'text-red-600', emoji: '🔴' },
};

const AssignmentCard = ({ assignment, onAccept, onReject, onComplete }) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const statusConfig = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const urgencyConfig = URGENCY_CONFIG[assignment.task?.urgency] || URGENCY_CONFIG.MEDIUM;

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(assignment.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(assignment.id, rejectReason);
      setIsRejecting(false);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const canAccept = assignment.status === 'PENDING';
  const canReject = assignment.status === 'PENDING';
  const canComplete = ['ACCEPTED', 'IN_PROGRESS'].includes(assignment.status);

  return (
    <div
      className={`
        group relative flex flex-col gap-3 rounded-2xl border-2 p-4 shadow-lg 
        transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]
        ${statusConfig.color}
        animate-slide-up
      `}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <span
          className={`
            inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold
            ${statusConfig.badge}
          `}
        >
          <StatusIcon className="h-4 w-4" />
          {statusConfig.label}
        </span>
        
        {assignment.task?.urgency && (
          <span className={`text-xs font-semibold ${urgencyConfig.color}`}>
            {urgencyConfig.emoji} {urgencyConfig.label}
          </span>
        )}
      </div>

      {/* Task info */}
      <div>
        <h3 className="text-lg font-bold text-ink mb-1 line-clamp-2">
          {assignment.task?.title || 'Misión sin título'}
        </h3>
        <p className="text-sm text-muted line-clamp-2">
          {assignment.task?.description || 'Sin descripción'}
        </p>
      </div>

      {/* Details */}
      <div className="space-y-2 text-xs text-muted">
        {assignment.task?.locationName && (
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-primary" />
            <span>{assignment.task.locationName}</span>
          </div>
        )}
        
        {assignment.task?.startAt && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <span>Inicia: {formatDateTime(assignment.task.startAt)}</span>
          </div>
        )}

        {assignment.assignedAt && (
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-primary" />
            <span>Asignado: {formatDateTime(assignment.assignedAt)}</span>
          </div>
        )}

        {assignment.task?.organization?.name && (
          <div className="text-xs font-semibold text-primary">
            🏢 {assignment.task.organization.name}
          </div>
        )}
      </div>

      {/* Actions */}
      {canAccept && !isRejecting && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
          >
            ✅ Aceptar
          </button>
          <button
            onClick={() => setIsRejecting(true)}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed button-hover"
          >
            ❌ Rechazar
          </button>
        </div>
      )}

      {isRejecting && (
        <div className="space-y-2 animate-slide-down">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo del rechazo (opcional)..."
            className="w-full rounded-xl border-2 border-slate-200 p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleRejectSubmit}
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 button-hover"
            >
              Confirmar Rechazo
            </button>
            <button
              onClick={() => {
                setIsRejecting(false);
                setRejectReason('');
              }}
              disabled={isProcessing}
              className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-ink hover:bg-slate-50 button-hover"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {canComplete && (
        <button
          onClick={() => onComplete(assignment)}
          disabled={isProcessing}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 button-hover mt-2"
        >
          🎯 Marcar como Completada
        </button>
      )}

      {assignment.status === 'COMPLETED' && assignment.rating && (
        <div className="rounded-xl bg-white/80 p-3 text-center">
          <p className="text-2xl mb-1">{'⭐'.repeat(assignment.rating)}</p>
          <p className="text-xs text-muted">Calificación recibida</p>
        </div>
      )}

      {assignment.status === 'VERIFIED' && (
        <div className="rounded-xl bg-green-100 p-3 text-center">
          <p className="text-sm font-bold text-green-700">
            ✅ Misión verificada y puntos otorgados
          </p>
        </div>
      )}

      {/* Efecto de brillo */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default AssignmentCard;

