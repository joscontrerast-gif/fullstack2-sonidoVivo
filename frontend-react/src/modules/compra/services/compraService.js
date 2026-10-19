import { vaciarCarrito } from '../../../services/carrito.js';

export const COSTOS_ENTREGA = {
  estandar: 1990,
  express: 4990,
};

export const NOMBRES_ENTREGA = {
  estandar: 'Entrega estándar',
  express: 'Entrega express',
};

export function formatoPrecio(valor) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);
}

export function obtenerCostoEntrega(tipo) {
  return COSTOS_ENTREGA[tipo] ?? COSTOS_ENTREGA.estandar;
}

export function calcularSubtotal(productos) {
  return productos.reduce(
    (suma, producto) =>
      suma + Number(producto.precio) * Number(producto.cantidad),
    0
  );
}

export function calcularTotal(productos, tipoEntrega) {
  return calcularSubtotal(productos) + obtenerCostoEntrega(tipoEntrega);
}

export function validarDatosEnvio({ direccion, comuna }) {
  const errores = {};

  if (!direccion || direccion.trim().length < 5) {
    errores.direccion = 'Ingresa una dirección de al menos 5 caracteres.';
  }

  if (!comuna || comuna.trim().length < 3) {
    errores.comuna = 'Ingresa una comuna de al menos 3 caracteres.';
  }

  return errores;
}

export function validarCarrito(productos) {
  if (productos.length === 0) {
    return 'Tu carrito está vacío.';
  }

  const sinStock = productos.find(
    (producto) =>
      producto.cantidad < 1 || producto.cantidad > Number(producto.stock)
  );

  if (sinStock) {
    return `La cantidad de ${sinStock.nombre} supera el stock disponible.`;
  }

  return '';
}

export function construirResumen(productos, datos) {
  return {
    productos: productos.map((producto) => ({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: Number(producto.precio),
      cantidad: producto.cantidad,
      subtotal: Number(producto.precio) * producto.cantidad,
    })),
    direccion: datos.direccion,
    comuna: datos.comuna,
    entrega: NOMBRES_ENTREGA[datos.entrega] ?? NOMBRES_ENTREGA.estandar,
    costoEntrega: obtenerCostoEntrega(datos.entrega),
    total: calcularTotal(productos, datos.entrega),
    fecha: new Date().toLocaleString('es-CL'),
  };
}

// Valida todo y, si está correcto, vacía el carrito y devuelve el resumen.
export function confirmarCompra(productos, datos) {
  const mensajeCarrito = validarCarrito(productos);

  if (mensajeCarrito) {
    return { exito: false, mensaje: mensajeCarrito, errores: {}, resumen: null };
  }

  const errores = validarDatosEnvio(datos);

  if (Object.keys(errores).length > 0) {
    return {
      exito: false,
      mensaje: 'Revisa los datos de envío.',
      errores,
      resumen: null,
    };
  }

  const resumen = construirResumen(productos, datos);
  vaciarCarrito();

  return { exito: true, mensaje: '', errores: {}, resumen };
}
