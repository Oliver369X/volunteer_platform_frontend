'use strict';

export const buildQueryString = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );
  if (!entries.length) return '';
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
    } else {
      search.append(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

export const extractErrorMessage = (error) => {
  if (!error) return 'Ocurrió un error inesperado';
  if (typeof error === 'string') return error;
  return error.message ?? 'Ocurrió un error inesperado';
};



