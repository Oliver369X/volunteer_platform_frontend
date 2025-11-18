'use strict';

import dayjs from 'dayjs';

export const formatNumber = (value, options = {}) => {
  if (value === null || value === undefined) return '--';
  return new Intl.NumberFormat('es-BO', options).format(Number(value));
};

export const formatPoints = (points) => `${formatNumber(points)} pts`;

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '--';
  return `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

export const formatDateTime = (date) => {
  if (!date) return '--';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
};

export const formatDate = (date) => {
  if (!date) return '--';
  return dayjs(date).format('DD/MM/YYYY');
};



