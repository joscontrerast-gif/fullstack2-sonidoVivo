// Cliente HTTP común a todas las llamadas al backend.
// - Agrega el token JWT cuando la llamada es autenticada.
// - Convierte los errores del servidor en ErrorApi (mensaje, estado y errores por campo).
// - Si el servidor responde 401 en una llamada autenticada, la sesión venció:
//   se borra y se avisa con un evento para que la aplicación vuelva al login.

import { borrarSesion, obtenerToken } from './sesion.js';

export const EVENTO_SESION_EXPIRADA = 'sonidovivo:sesion-expirada';

export class ErrorApi extends Error {
  constructor(mensaje, estado = 0, errores = {}) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.errores = errores;
  }
}

function armarUrl(base, ruta, parametros) {
  const consulta = new URLSearchParams();

  Object.entries(parametros ?? {}).forEach(([nombre, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      consulta.append(nombre, String(valor));
    }
  });

  const texto = consulta.toString();

  return `${base}${ruta}${texto ? `?${texto}` : ''}`;
}

export async function peticion(
  base,
  ruta,
  { metodo = 'GET', cuerpo, autenticada = false, parametros } = {}
) {
  const cabeceras = { Accept: 'application/json' };

  if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json';
  }

  if (autenticada) {
    const token = obtenerToken();

    if (token) {
      cabeceras.Authorization = `Bearer ${token}`;
    }
  }

  let respuesta;

  try {
    respuesta = await fetch(armarUrl(base, ruta, parametros), {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi(
      'No se pudo conectar con el servidor. Revisa que el backend esté en ejecución.'
    );
  }

  let datos = null;

  try {
    datos = await respuesta.json();
  } catch {
    // Respuestas sin cuerpo (por ejemplo 204 al eliminar)
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && autenticada) {
      borrarSesion();
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }

    throw new ErrorApi(
      datos?.mensaje || `El servidor respondió con el error ${respuesta.status}.`,
      respuesta.status,
      datos?.errores || {}
    );
  }

  return datos;
}
