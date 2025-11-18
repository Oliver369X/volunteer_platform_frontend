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

  return {
    getTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    runMatching,
    getVolunteerProfile,
    updateVolunteerProfile,
    getVolunteerGamification,
    getLeaderboard,
    getOrganizationMemberships,
    getOrganizationDetails,
    addOrganizationMember,
    getOrganizationReport,
    getVolunteerReport,
    listVolunteers,
  };
};

export default useApi;



