// API configuration utility
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // Use proxy in development
  : 'https://ebillpymetest.facturaenlinea.co/api'; // Direct call in production

export const getApiUrl = (endpoint: string) => {
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
