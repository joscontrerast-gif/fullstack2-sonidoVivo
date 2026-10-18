
export async function obtenerProductos() {
  const respuesta = await fetch('/data/productos.json');

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los productos');
  }

  return await respuesta.json();
}
