// Lógica del módulo de encargos (órdenes de compra) y del dashboard.
// Los datos vienen del backend (admin-service) a través de src/api.

import { dashboardApi, encargosApi } from '../../../api/adminApi.js';
import { ESTADOS_ENCARGO } from '../../../data/encargos.js';

export { ESTADOS_ENCARGO };

// El panel muestra el N° de orden ("ORD-001"); el backend identifica cada
// encargo con un id numérico. Esta tabla recuerda la equivalencia.
const idsPorOrden = new Map();

export function limpiarCacheEncargos() {
  idsPorOrden.clear();
}

// Convierte un encargo del backend a la forma que usan los componentes.
export function aEncargo(dto) {
  idsPorOrden.set(dto.numeroOrden, dto.id);

  return {
    id: dto.numeroOrden,
    idApi: dto.id,
    fecha: String(dto.fecha ?? '').slice(0, 10),
    cliente: dto.cliente,
    correo: dto.correo,
    total: dto.total,
    estado: dto.estado,
    tipoEntrega:
      dto.tipoEntrega === 'Retiro en tienda' ? 'retiro' : dto.tipoEntrega,
    items: dto.items ?? [],
  };
}

// Más recientes primero (así los entrega el backend).
// Se puede filtrar por estado ('todos' muestra todos).
export async function listarEncargos(filtroEstado = 'todos') {
  const lista = await encargosApi.listar(
    filtroEstado === 'todos' ? undefined : filtroEstado
  );

  return lista.map(aEncargo);
}

export function listarPendientes() {
  return listarEncargos('Pendiente');
}

export async function cambiarEstado(id, nuevoEstado) {
  if (!ESTADOS_ENCARGO.includes(nuevoEstado)) {
    throw new Error(`El estado "${nuevoEstado}" no es válido.`);
  }

  if (!idsPorOrden.has(id)) {
    await listarEncargos();
  }

  const idApi = idsPorOrden.get(id);

  if (idApi === undefined) {
    throw new Error(`No existe el encargo "${id}".`);
  }

  return aEncargo(await encargosApi.cambiarEstado(idApi, nuevoEstado));
}

export async function detalleEncargo(id) {
  if (!idsPorOrden.has(id)) {
    await listarEncargos();
  }

  const idApi = idsPorOrden.get(id);

  return idApi === undefined ? null : aEncargo(await encargosApi.obtener(idApi));
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
  if (String(tipoEntrega).startsWith('Entrega')) return tipoEntrega;
  if (tipoEntrega) return 'Despacho a domicilio';

  return 'No informado';
}

// Cantidad de encargos por estado, para el dashboard
export async function resumenEncargos() {
  const datos = await dashboardApi.resumen();
  const resumen = { total: datos.totalEncargos };

  ESTADOS_ENCARGO.forEach((estado) => {
    resumen[estado] = datos.encargosPorEstado?.[estado] ?? 0;
  });

  return resumen;
}
