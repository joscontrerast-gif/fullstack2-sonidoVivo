// Sesión del usuario: el token JWT que entrega auth-service se guarda en
// localStorage para que la sesión sobreviva a recargar la página.

export const CLAVE_SESION = 'sesionSonidoVivo';

export function leerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));

    if (!sesion || !sesion.token || !sesion.usuario) {
      return null;
    }

    if (sesion.expiraEn && Date.now() > sesion.expiraEn) {
      borrarSesion();
      return null;
    }

    return sesion;
  } catch {
    return null;
  }
}

/** Guarda la respuesta del login: { token, expiraEnSegundos, usuario }. */
export function guardarSesion({ token, expiraEnSegundos, usuario }) {
  const sesion = {
    token,
    usuario,
    expiraEn: expiraEnSegundos ? Date.now() + expiraEnSegundos * 1000 : null,
  };

  localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));

  return sesion;
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}

export function obtenerToken() {
  return leerSesion()?.token ?? null;
}
