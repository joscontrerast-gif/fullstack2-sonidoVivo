import { URLS, apiFetch } from './api.js';

// Encargos del cliente con sesión iniciada (ms-carrito, GET /api/encargos/mis).
export async function obtenerMisEncargos() {
  const encargos = await apiFetch(URLS.carrito, '/api/encargos/mis');
  return Array.isArray(encargos) ? encargos : [];
}
