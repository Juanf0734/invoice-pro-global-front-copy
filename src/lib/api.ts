// API configuration utility
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' // En desarrollo usa el proxy de Vite
  : 'https://ebillpymetest.facturaenlinea.co/api'; // En producción usa la URL completa

export const getApiUrl = (endpoint: string) => {
  // Si el endpoint ya tiene el prefijo /api, lo removemos para evitar duplicados
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
