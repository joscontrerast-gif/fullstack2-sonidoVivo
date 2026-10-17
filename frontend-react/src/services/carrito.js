
const CLAVE_CARRITO = 'carritoSonidoVivo';

export function obtenerCarrito() {
  try {
    const carritoGuardado = localStorage.getItem(CLAVE_CARRITO);
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  } catch {
    return [];
  }
}

export function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

export function agregarAlCarrito(codigo) {
  const carrito = obtenerCarrito();

  const existente = carrito.find(
    (item) => String(item.codigo) === String(codigo)
  );

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      codigo,
      cantidad: 1,
    });
  }

  guardarCarrito(carrito);
  return carrito;
}

export function cambiarCantidad(codigo, cantidad) {
  const carrito = obtenerCarrito().map((item) =>
    String(item.codigo) === String(codigo)
      ? { ...item, cantidad: Math.max(1, Number(cantidad) || 1) }
      : item
  );

  guardarCarrito(carrito);
  return carrito;
}

export function eliminarDelCarrito(codigo) {
  const carrito = obtenerCarrito().filter(
    (item) => String(item.codigo) !== String(codigo)
  );

  guardarCarrito(carrito);
  return carrito;
}

export function vaciarCarrito() {
  localStorage.removeItem(CLAVE_CARRITO);
}
