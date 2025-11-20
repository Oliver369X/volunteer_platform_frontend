'use strict';

import { useState, useEffect } from 'react';
import useApi from '../hooks/useApi.js';
import { XMarkIcon, UserGroupIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AssignVolunteerModal = ({ isOpen, onClose, onAssigned, taskId, api }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadVolunteers();
    }
  }, [isOpen]);

  const loadVolunteers = async () => {
    try {
      setSearching(true);
      setError(null);
      const response = await api.listVolunteers({ limit: 50 });
      // The API returns { status: 'success', data: [...] } or just an array
      const volunteersList = Array.isArray(response) 
        ? response 
        : response?.data || response?.volunteers || [];
      setVolunteers(volunteersList);
    } catch (err) {
      setError(err.message || 'Error al cargar voluntarios');
      console.error('Error loading volunteers:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedVolunteerId) {
      setError('Por favor selecciona un voluntario');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Use userId if available, otherwise use the id directly
      const volunteer = volunteers.find((v) => v.id === selectedVolunteerId || v.userId === selectedVolunteerId);
      const volunteerUserId = volunteer?.userId || volunteer?.user?.id || selectedVolunteerId;
      
      const result = await api.assignTaskToVolunteer(taskId, volunteerUserId);
      onAssigned(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al asignar la tarea');
      console.error('Error assigning task:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    // Handle both data structures: direct user fields or nested user object
    const fullName = volunteer.user?.fullName || volunteer.fullName || '';
    const email = volunteer.user?.email || volunteer.email || '';
    const skills = volunteer.skills || volunteer.volunteerProfile?.skills || [];
    
    return (
      fullName.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      skills.some((skill) => skill.toLowerCase().includes(search))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl m-4 animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-slate-200 bg-gradient-to-r from-primary/10 to-emerald/10 px-6 py-4">
          <h2 className="text-2xl font-bold text-ink flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6" />
            Asignar Voluntario
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o habilidades..."
              className="w-full pl-12 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Volunteers List */}
          {searching ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted">Cargando voluntarios...</p>
            </div>
          ) : filteredVolunteers.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-muted">
                {searchTerm ? 'No se encontraron voluntarios' : 'No hay voluntarios disponibles'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredVolunteers.map((volunteer) => {
                // Use userId if available, otherwise use id
                const volunteerId = volunteer.userId || volunteer.user?.id || volunteer.id;
                const isSelected = selectedVolunteerId === volunteerId || selectedVolunteerId === volunteer.id;
                return (
                  <button
                    key={volunteer.id || volunteer.userId}
                    type="button"
                    onClick={() => setSelectedVolunteerId(volunteerId)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-white shadow-lg ${
                          isSelected
                            ? 'bg-gradient-to-br from-primary to-primary-dark'
                            : 'bg-gradient-to-br from-slate-400 to-slate-600'
                        }`}
                      >
                        {(volunteer.user?.fullName || volunteer.fullName || 'V').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-ink">
                          {volunteer.user?.fullName || volunteer.fullName || 'Voluntario'}
                        </p>
                        <p className="text-xs text-muted">
                          {volunteer.user?.email || volunteer.email || ''}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="text-xs font-semibold text-primary">
                            Nivel: {volunteer.level || volunteer.volunteerProfile?.level || 'BRONCE'}
                          </span>
                          <span className="text-xs text-muted">•</span>
                          <span className="text-xs text-muted">
                            {volunteer.totalPoints || volunteer.volunteerProfile?.totalPoints || 0} puntos
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="rounded-full bg-primary p-1">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={loading || !selectedVolunteerId}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Asignando...' : '✅ Asignar Voluntario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignVolunteerModal;

