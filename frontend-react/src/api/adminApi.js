// Llamadas a admin-service (puerto 8082). Todas llevan el token JWT.

import { URL_ADMIN } from './config.js';
import { peticion } from './http.js';

const admin = (ruta, opciones = {}) =>
  peticion(URL_ADMIN, `/api/admin${ruta}`, { autenticada: true, ...opciones });

export const productosApi = {
  listar({ todos = false } = {}) {
    return admin('/productos', { parametros: { todos } });
  },

  crear(producto) {
    return admin('/productos', { metodo: 'POST', cuerpo: producto });
  },

  actualizar(codigo, producto) {
    return admin(`/productos/${encodeURIComponent(codigo)}`, {
      metodo: 'PUT',
      cuerpo: producto,
    });
  },

  /** Devuelve { eliminado, mensaje }: si el producto tiene ventas solo se desactiva. */
  eliminar(codigo) {
    return admin(`/productos/${encodeURIComponent(codigo)}`, {
      metodo: 'DELETE',
    });
  },
};

export const encargosApi = {
  listar(estado) {
    return admin('/encargos', { parametros: { estado } });
  },

  obtener(id) {
    return admin(`/encargos/${id}`);
  },

  cambiarEstado(id, estado) {
    return admin(`/encargos/${id}/estado`, {
      metodo: 'PATCH',
      cuerpo: { estado },
    });
  },
};

export const usuariosApi = {
  /** grupo: 'clientes' | 'empleados' | undefined (todos). */
  listar(grupo) {
    return admin('/usuarios', { parametros: { grupo } });
  },

  crear(usuario) {
    return admin('/usuarios', { metodo: 'POST', cuerpo: usuario });
  },

  actualizar(id, usuario) {
    return admin(`/usuarios/${id}`, { metodo: 'PUT', cuerpo: usuario });
  },

  eliminar(id) {
    return admin(`/usuarios/${id}`, { metodo: 'DELETE' });
  },
};

export const dashboardApi = {
  resumen() {
    return admin('/dashboard');
  },
};
