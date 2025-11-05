// API configuration utility
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // Use proxy in development
  : 'https://0d1eb018dccf.ngrok-free.app/api'; // Direct call in production

export const getApiUrl = (endpoint: string) => {
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
