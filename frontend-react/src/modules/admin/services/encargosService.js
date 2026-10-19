// Lógica del módulo de encargos (órdenes de compra) y del dashboard.

import {
  ESTADOS_ENCARGO,
  actualizarEstadoEncargo,
  obtenerEncargoPorId,
  obtenerEncargos,
} from '../../../data/encargos.js';

export { ESTADOS_ENCARGO };

// Más recientes primero, como en el sitio original.
// Se puede filtrar por estado ('todos' muestra todos).
export function listarEncargos(filtroEstado = 'todos') {
  const encargos = obtenerEncargos().filter(
    (encargo) => filtroEstado === 'todos' || encargo.estado === filtroEstado
  );

  return [...encargos].reverse();
}

export function listarPendientes() {
  return listarEncargos('Pendiente');
}

export function cambiarEstado(id, nuevoEstado) {
  return actualizarEstadoEncargo(id, nuevoEstado);
}

export function detalleEncargo(id) {
  return obtenerEncargoPorId(id);
}

export function formatearTotal(total) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Number(total) || 0);
}

export function textoEntrega(tipoEntrega) {
  if (tipoEntrega === 'retiro') return 'Retiro en tienda';
  if (tipoEntrega) return 'Despacho a domicilio';

  return 'No informado';
}

// Cantidad de encargos por estado, para el dashboard
export function resumenEncargos() {
  const encargos = obtenerEncargos();
  const resumen = { total: encargos.length };

  ESTADOS_ENCARGO.forEach((estado) => {
    resumen[estado] = encargos.filter((e) => e.estado === estado).length;
  });

  return resumen;
}
