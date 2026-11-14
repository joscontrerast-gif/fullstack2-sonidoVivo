import { URLS, apiFetch, guardarSesion, limpiarSesion } from './api.js';

export async function iniciarSesion(correo, password) {
  const res = await apiFetch(URLS.auth, '/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, password }),
  });
  guardarSesion(res.token, res.usuario);
  return res;
}

export async function registrarUsuario(datos) {
  return await apiFetch(URLS.auth, '/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function obtenerPerfilActual() {
  return await apiFetch(URLS.auth, '/api/auth/me');
}

export function cerrarSesion() {
  limpiarSesion();
}

export async function obtenerRegiones() {
  return await apiFetch(URLS.auth, '/api/regiones');
}

export async function obtenerComunas(idRegion) {
  return await apiFetch(URLS.auth, `/api/comunas?idRegion=${encodeURIComponent(idRegion)}`);
}