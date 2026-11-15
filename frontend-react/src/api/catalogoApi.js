// Catálogo público de la tienda (no necesita token): admin-service /api/productos.

import { URL_ADMIN } from './config.js';
import { peticion } from './http.js';

export const catalogoApi = {
  listar() {
    return peticion(URL_ADMIN, '/api/productos');
  },
};
