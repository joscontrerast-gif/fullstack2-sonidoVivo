import { catalogoApi } from '../api/catalogoApi.js';

// Productos de la tienda: vienen de la base de datos (Oracle) a través del
// backend, así los cambios hechos en el panel de administración se ven aquí.
export async function obtenerProductos() {
  try {
    return await catalogoApi.listar();
  } catch {
    throw new Error('No se pudieron cargar los productos');
  }
}
