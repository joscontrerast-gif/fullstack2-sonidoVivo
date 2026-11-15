// Llamadas a auth-service (puerto 8081): sesión y datos de ubicación.

import { URL_AUTH } from './config.js';
import { peticion } from './http.js';

export const authApi = {
  /** Devuelve { token, tipo, expiraEnSegundos, usuario }. */
  iniciarSesion(correo, password) {
    return peticion(URL_AUTH, '/api/auth/login', {
      metodo: 'POST',
      cuerpo: { correo, password },
    });
  },

  registrar(datos) {
    return peticion(URL_AUTH, '/api/auth/registro', {
      metodo: 'POST',
      cuerpo: datos,
    });
  },
};

export const ubicacionesApi = {
  regiones() {
    return peticion(URL_AUTH, '/api/regiones');
  },

  /** Todas las comunas, cada una con su idRegion. */
  comunas() {
    return peticion(URL_AUTH, '/api/comunas');
  },
};
