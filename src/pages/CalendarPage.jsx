'use strict';

import { useState, useMemo } from 'react';
import { useEffect } from 'react';
import useApi from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const CalendarPage = () => {
  const api = useApi();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTasks({});
      setTasks(Array.isArray(data) ? data : data?.tasks ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener días del mes actual
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior (espacios vacíos)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Buscar tareas para este día
      const dayTasks = tasks.filter(task => {
        if (!task.startAt) return false;
        const taskDate = new Date(task.startAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      });

      days.push({
        day,
        date,
        dateStr,
        tasks: dayTasks,
        isToday: new Date().toDateString() === date.toDateString(),
      });
    }

    return days;
  }, [currentDate, tasks]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const tasksForSelectedDate = selectedDate
    ? tasks.filter(task => {
        if (!task.startAt) return false;
        const taskDate = new Date(task.startAt).toISOString().split('T')[0];
        return taskDate === selectedDate.dateStr;
      })
    : [];

  if (loading) {
    return <LoadingSpinner label="Cargando calendario..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="📅 Calendario de Misiones"
        description="Visualiza y planifica las misiones en el tiempo"
      />

      {error && <ErrorAlert message={error} />}

      {/* Calendario */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-ink">
            {MESES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="rounded-xl border-2 border-slate-200 bg-white p-2 text-muted transition-all hover:border-primary hover:text-primary button-hover"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-xl border-2 border-primary bg-primary/5 px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white button-hover"
            >
              Hoy
            </button>
            <button
              onClick={nextMonth}
              className="rounded-xl border-2 border-slate-200 bg-white p-2 text-muted transition-all hover:border-primary hover:text-primary button-hover"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DIAS_SEMANA.map(dia => (
            <div key={dia} className="text-center text-sm font-bold text-muted py-2">
              {dia}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayInfo, idx) => {
            if (!dayInfo) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const hasTaskscont = dayInfo.tasks.length > 0;
            const isSelected = selectedDate?.dateStr === dayInfo.dateStr;

            return (
              <button
                key={dayInfo.dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dayInfo)}
                className={`
                  relative aspect-square rounded-xl p-2 text-sm font-semibold transition-all
                  ${dayInfo.isToday 
                    ? 'border-2 border-primary bg-primary/10 text-primary' 
                    : isSelected
                      ? 'border-2 border-primary bg-primary text-white'
                      : hasTaskscont
                        ? 'border-2 border-emerald-200 bg-emerald-50 text-ink hover:border-emerald-400'
                        : 'border-2 border-slate-200 bg-white text-ink hover:border-slate-300 hover:bg-slate-50'
                  }
                  button-hover
                `}
              >
                <span className="block">{dayInfo.day}</span>
                {hasTaskscont && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayInfo.tasks.slice(0, 3).map((_, i) => (
                      <span key={i} className="h-1 w-1 rounded-full bg-emerald-500" />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tareas del día seleccionado */}
      {selectedDate && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg animate-slide-up">
          <h3 className="text-lg font-bold text-ink mb-4">
            📋 Misiones para {selectedDate.date.toLocaleDateString('es-BO', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>

          {tasksForSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <CalendarIcon className="h-12 w-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">No hay misiones programadas para este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksForSelectedDate.map(task => (
                <div
                  key={task.id}
                  className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 transition-all hover:border-primary hover:bg-white button-hover"
                  onClick={() => window.location.href = `/dashboard/tasks/${task.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-ink mb-1">{task.title}</h4>
                      <p className="text-xs text-muted line-clamp-2">{task.description}</p>
                      {task.locationName && (
                        <p className="text-xs text-primary mt-2">📍 {task.locationName}</p>
                      )}
                    </div>
                    <span className={`
                      inline-flex rounded-full px-3 py-1 text-xs font-bold
                      ${task.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' : ''}
                      ${task.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' : ''}
                      ${task.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${task.urgency === 'LOW' ? 'bg-green-100 text-green-700' : ''}
                    `}>
                      {task.urgency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

