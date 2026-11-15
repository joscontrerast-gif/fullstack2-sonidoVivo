import { URLS, apiFetch, obtenerToken } from './api.js';

const CLAVE_CARRITO = 'carritoSonidoVivo';
export const EVENTO_CARRITO = 'sonidovivo:carrito-actualizado';

export function contarItemsCarrito(carrito) {
  if (!Array.isArray(carrito)) return 0;
  return carrito.reduce((suma, item) => suma + (Number(item.cantidad) || 0), 0);
}

function notificarCarrito(carrito) {
  window.dispatchEvent(new CustomEvent(EVENTO_CARRITO, { detail: carrito }));
}

// --- Funciones síncronas (invitados y pruebas unitarias carrito.spec.js) ---

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
  notificarCarrito(carrito);
}

export function agregarAlCarrito(codigo, stockDisponible) {
  const carrito = obtenerCarrito();
  const existente = carrito.find((item) => String(item.codigo) === String(codigo));
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
  const existente = carrito.find((item) => String(item.codigo) === String(codigo));

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
  notificarCarrito([]);
}

// --- Funciones conectadas al microservicio ms-carrito (puerto 8083) ---

export async function obtenerCarritoApi() {
  if (!obtenerToken()) return obtenerCarrito();
  const carrito = await apiFetch(URLS.carrito, '/api/carrito');
  notificarCarrito(carrito);
  return carrito;
}

export async function agregarAlCarritoApi(codigo, cantidad = 1, stockDisponible = 999999) {
  if (!obtenerToken()) {
    return agregarAlCarrito(codigo, stockDisponible);
  }
  try {
    const carrito = await apiFetch(URLS.carrito, '/api/carrito/items', {
      method: 'POST',
      body: JSON.stringify({ codigo, cantidad }),
    });
    notificarCarrito(carrito);
    return { exito: true, mensaje: '¡Producto agregado al carrito!', carrito };
  } catch (error) {
    return { exito: false, mensaje: error.message, carrito: [] };
  }
}

export async function cambiarCantidadApi(codigo, cantidad, stockDisponible = 999999) {
  if (!obtenerToken()) {
    return cambiarCantidad(codigo, cantidad, stockDisponible);
  }
  try {
    const carrito = await apiFetch(
      URLS.carrito,
      `/api/carrito/items/${encodeURIComponent(codigo)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ cantidad: Math.floor(Number(cantidad)) }),
      }
    );
    notificarCarrito(carrito);
    return { exito: true, mensaje: '', carrito };
  } catch (error) {
    return { exito: false, mensaje: error.message, carrito: [] };
  }
}

export async function eliminarDelCarritoApi(codigo) {
  if (!obtenerToken()) {
    return eliminarDelCarrito(codigo);
  }
  const carrito = await apiFetch(
    URLS.carrito,
    `/api/carrito/items/${encodeURIComponent(codigo)}`,
    { method: 'DELETE' }
  );
  notificarCarrito(carrito);
  return carrito;
}

export async function vaciarCarritoApi() {
  if (!obtenerToken()) {
    vaciarCarrito();
    return [];
  }
  await apiFetch(URLS.carrito, '/api/carrito', { method: 'DELETE' });
  notificarCarrito([]);
  return [];
}