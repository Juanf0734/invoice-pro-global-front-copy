// API configuration utility
const API_BASE_URL = '/api';

export const getApiUrl = (endpoint: string) => {
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
