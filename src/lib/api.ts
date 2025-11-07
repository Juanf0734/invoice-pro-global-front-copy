// API configuration utility
const API_BASE_URL = 'https://b4e87f0a30e1.ngrok-free.app/api';

export const getApiUrl = (endpoint: string) => {
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
