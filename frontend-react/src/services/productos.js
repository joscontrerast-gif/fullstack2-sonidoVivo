import { obtenerProductos as obtenerProductosData } from '../data/productos.js';

export async function obtenerProductos() {
  return await obtenerProductosData();
}