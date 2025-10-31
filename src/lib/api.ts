// API configuration utility
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment ? '/api' : 'https://ebillpymetest.facturaenlinea.co/api';

export const getApiUrl = (endpoint: string) => {
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
