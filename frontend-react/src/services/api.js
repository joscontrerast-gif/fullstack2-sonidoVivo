export const URLS = {
  auth: import.meta.env.VITE_AUTH_URL ?? 'http://localhost:8081',
  admin: import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:8082',
  carrito: import.meta.env.VITE_CARRITO_URL ?? 'http://localhost:8083',
};

const CLAVE_TOKEN = 'sonidovivo_token';
const CLAVE_USUARIO = 'sonidovivo_usuario';

export function obtenerToken() {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function obtenerUsuarioGuardado() {
  try {
    const raw = localStorage.getItem(CLAVE_USUARIO);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(token, usuario) {
  localStorage.setItem(CLAVE_TOKEN, token);
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function limpiarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}

export async function apiFetch(baseUrl, path, options = {}) {
  const token = obtenerToken();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const respuesta = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (respuesta.status === 204) {
    return null;
  }

  let data = null;
  if (typeof respuesta.text === 'function') {
    const texto = await respuesta.text();
    if (texto) {
      try {
        data = JSON.parse(texto);
      } catch {
        data = texto;
      }
    }
  } else if (typeof respuesta.json === 'function') {
    data = await respuesta.json();
  }

  if (!respuesta.ok) {
    const mensaje =
      (data && typeof data === 'object' && (data.mensaje || data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      `Error HTTP ${respuesta.status}`;
    const error = new Error(mensaje);
    error.status = respuesta.status;
    error.data = data;
    throw error;
  }

  return data;
}