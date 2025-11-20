'use strict';

import { useCallback } from 'react';
import useAuth from './useAuth.js';
import { buildQueryString } from '../lib/api.js';

const useApi = () => {
  const { authFetch } = useAuth();

  const getTasks = useCallback(
    async (params) => {
      const query = buildQueryString(params);
      return authFetch(`/tasks${query}`);
    },
    [authFetch],
  );

  const createTask = useCallback(
    async (payload) => authFetch('/tasks', { method: 'POST', body: payload }),
    [authFetch],
  );

  const updateTask = useCallback(
    async (taskId, payload) => authFetch(`/tasks/${taskId}`, { method: 'PATCH', body: payload }),
    [authFetch],
  );

  const updateTaskStatus = useCallback(
    async (taskId, status) =>
      authFetch(`/tasks/${taskId}/status`, { method: 'PATCH', body: { status } }),
    [authFetch],
  );

  const runMatching = useCallback(
    async (taskId, payload) =>
      authFetch(`/matching/tasks/${taskId}/run`, { method: 'POST', body: payload }),
    [authFetch],
  );

  const getVolunteerProfile = useCallback(
    async () => authFetch('/auth/me'),
    [authFetch],
  );

  const updateVolunteerProfile = useCallback(
    async (payload) =>
      authFetch('/users/me/volunteer-profile', { method: 'PATCH', body: payload }),
    [authFetch],
  );

  const getVolunteerGamification = useCallback(
    async () => authFetch('/gamification/me'),
    [authFetch],
  );

  const getLeaderboard = useCallback(
    async (params) => {
      const query = buildQueryString(params);
      return authFetch(`/gamification/leaderboard${query}`);
    },
    [authFetch],
  );

  const getOrganizationMemberships = useCallback(
    async () => authFetch('/organizations'),
    [authFetch],
  );

  const getOrganizationDetails = useCallback(
    async (organizationId) => authFetch(`/organizations/${organizationId}`),
    [authFetch],
  );

  const addOrganizationMember = useCallback(
    async (organizationId, payload) =>
      authFetch(`/organizations/${organizationId}/members`, { method: 'POST', body: payload }),
    [authFetch],
  );

  const getOrganizationReport = useCallback(
    async (params) => {
      const query = buildQueryString(params);
      return authFetch(`/reports/organization${query}`);
    },
    [authFetch],
  );

  const getVolunteerReport = useCallback(
    async (params) => {
      const query = buildQueryString(params);
      return authFetch(`/reports/volunteer${query}`);
    },
    [authFetch],
  );

  const listVolunteers = useCallback(
    async (params) => {
      const query = buildQueryString(params);
      return authFetch(`/users/volunteers${query}`);
    },
    [authFetch],
  );

  // ============================================
  // ASSIGNMENTS - Gestión de Asignaciones
  // ============================================
  const getMyAssignments = useCallback(
    async (params) => {
      const query = buildQueryString(params);
      return authFetch(`/gamification/assignments${query}`);
    },
    [authFetch],
  );

  const acceptAssignment = useCallback(
    async (assignmentId) =>
      authFetch(`/gamification/assignments/${assignmentId}/accept`, { method: 'POST' }),
    [authFetch],
  );

  const rejectAssignment = useCallback(
    async (assignmentId, reason) =>
      authFetch(`/gamification/assignments/${assignmentId}/reject`, {
        method: 'POST',
        body: { reason },
      }),
    [authFetch],
  );

  const completeAssignment = useCallback(
    async (assignmentId, payload) =>
      authFetch(`/gamification/assignments/${assignmentId}/complete`, {
        method: 'POST',
        body: payload,
      }),
    [authFetch],
  );

  // ============================================
  // TASKS DETAIL - Detalle de Tareas
  // ============================================
  const getTaskDetail = useCallback(
    async (taskId) => authFetch(`/tasks/${taskId}`),
    [authFetch],
  );

  const deleteTask = useCallback(
    async (taskId) => authFetch(`/tasks/${taskId}`, { method: 'DELETE' }),
    [authFetch],
  );

  // ============================================
  // USER PROFILE - Perfil de Usuario
  // ============================================
  const updateUserProfile = useCallback(
    async (payload) => authFetch('/users/me', { method: 'PATCH', body: payload }),
    [authFetch],
  );

  const changePassword = useCallback(
    async (payload) =>
      authFetch('/users/me/password', { method: 'PATCH', body: payload }),
    [authFetch],
  );

  const uploadAvatar = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return authFetch('/users/me/avatar', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });
    },
    [authFetch],
  );

  // ============================================
  // NOTIFICATIONS - Notificaciones (mock inicial)
  // ============================================
  const getNotifications = useCallback(
    async () => {
      // TODO: Implementar endpoint real en backend
      // Por ahora retornamos array vacío
      return [];
    },
    [authFetch],
  );

  const markNotificationAsRead = useCallback(
    async (notificationId) => {
      // TODO: Implementar endpoint real
      return { success: true };
    },
    [authFetch],
  );

  return {
    // Tasks
    getTasks,
    getTaskDetail,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    
    // Matching
    runMatching,
    
    // Assignments
    getMyAssignments,
    acceptAssignment,
    rejectAssignment,
    completeAssignment,
    
    // Profile
    getVolunteerProfile,
    updateVolunteerProfile,
    updateUserProfile,
    changePassword,
    uploadAvatar,
    
    // Gamification
    getVolunteerGamification,
    getLeaderboard,
    
    // Organizations
    getOrganizationMemberships,
    getOrganizationDetails,
    addOrganizationMember,
    
    // Reports
    getOrganizationReport,
    getVolunteerReport,
    
    // Volunteers
    listVolunteers,
    
    // Notifications
    getNotifications,
    markNotificationAsRead,
  };
};

export default useApi;



