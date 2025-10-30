// API configuration utility
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // En desarrollo usa el proxy de Vite
  : 'https://ebillpymetest.facturaenlinea.co/api'; // En producción usa la URL completa

export const getApiUrl = (endpoint: string) => {
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
