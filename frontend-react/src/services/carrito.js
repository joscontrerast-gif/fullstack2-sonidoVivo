
const CLAVE_CARRITO = 'carritoSonidoVivo';

export function obtenerCarrito() {
  try {
    const datos = localStorage.getItem(CLAVE_CARRITO);
    const carrito = datos ? JSON.parse(datos) : [];

    return Array.isArray(carrito) ? carrito : [];
  } catch {
    return [];
  }
}

export function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

export function agregarAlCarrito(codigo, stockDisponible) {
  const carrito = obtenerCarrito();

  const existente = carrito.find(
    (item) => String(item.codigo) === String(codigo)
  );

  const cantidadActual = existente ? Number(existente.cantidad) : 0;
  const stock = Number(stockDisponible);

  if (stock <= 0 || cantidadActual >= stock) {
    return {
      exito: false,
      mensaje: 'No hay más unidades disponibles para agregar.',
      carrito,
    };
  }

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ codigo, cantidad: 1 });
  }

  guardarCarrito(carrito);

  return {
    exito: true,
    mensaje: '¡Producto agregado al carrito!',
    carrito,
  };
}

export function cambiarCantidad(codigo, cantidad, stockDisponible) {
  const carrito = obtenerCarrito();

  const existente = carrito.find(
    (item) => String(item.codigo) === String(codigo)
  );

  if (!existente) {
    return { exito: false, mensaje: 'Producto no encontrado.', carrito };
  }

  const nuevaCantidad = Math.floor(Number(cantidad));
  const stock = Number(stockDisponible);

  if (
    !Number.isFinite(nuevaCantidad) ||
    nuevaCantidad < 1 ||
    stock < 1 ||
    nuevaCantidad > stock
  ) {
    return {
      exito: false,
      mensaje: `La cantidad debe estar entre 1 y ${Math.max(0, stock)}.`,
      carrito,
    };
  }

  existente.cantidad = nuevaCantidad;
  guardarCarrito(carrito);

  return { exito: true, mensaje: '', carrito };
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
