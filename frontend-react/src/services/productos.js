import { URLS, apiFetch, obtenerToken } from './api.js';
import { CLAVE_PRODUCTOS, obtenerProductos as obtenerProductosLocal } from '../data/productos.js';

export async function obtenerProductos(opciones) {
  if (!obtenerToken() && localStorage.getItem(CLAVE_PRODUCTOS)) {
    return await obtenerProductosLocal();
  }

  if (!opciones && !obtenerToken()) {
    const respuesta = await fetch('/data/productos.json');
    if (!respuesta.ok) {
      throw new Error('No se pudieron cargar los productos');
    }
    return await respuesta.json();
  }

  const { todos = false, q = '', categoria = '' } = opciones || {};
  const params = new URLSearchParams();
  if (todos) params.set('todos', 'true');
  if (q) params.set('q', q);
  if (categoria) params.set('categoria', categoria);

  const query = params.toString();
  const path = query ? `/api/admin/productos?${query}` : '/api/admin/productos';
  return await apiFetch(URLS.admin, path);
}

export async function obtenerProductoPorCodigo(codigo) {
  return await apiFetch(URLS.admin, `/api/admin/productos/${encodeURIComponent(codigo)}`);
}

export async function obtenerCategorias() {
  return await apiFetch(URLS.admin, '/api/admin/categorias');
}