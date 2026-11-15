import { URLS, apiFetch, obtenerToken } from '../../../services/api.js';
import {
  ESTADOS_ENCARGO,
  actualizarEstadoEncargo,
  obtenerEncargoPorId,
  obtenerEncargos,
} from '../../../data/encargos.js';

export { ESTADOS_ENCARGO };

// --- Funciones síncronas (tests unitarios encargos.spec.js) ---

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
  if (!tipoEntrega) return 'No informado';
  const val = String(tipoEntrega).toLowerCase();
  if (val.includes('retiro')) return 'Retiro en tienda';
  return 'Despacho a domicilio';
}

export function resumenEncargos() {
  const encargos = obtenerEncargos();
  const resumen = { total: encargos.length };

  ESTADOS_ENCARGO.forEach((estado) => {
    resumen[estado] = encargos.filter((e) => e.estado === estado).length;
  });

  return resumen;
}

// --- Funciones conectadas al microservicio admin (8082) ---

function normalizarEncargoBackend(e) {
  return {
    ...e,
    fecha: e.fecha ? new Date(e.fecha).toLocaleString('es-CL') : '—',
  };
}

export async function listarEncargosApi(filtroEstado = 'todos') {
  if (!obtenerToken()) {
    return listarEncargos(filtroEstado);
  }
  const path =
    filtroEstado && filtroEstado !== 'todos'
      ? `/api/admin/encargos?estado=${encodeURIComponent(filtroEstado)}`
      : '/api/admin/encargos';

  const lista = await apiFetch(URLS.admin, path);
  return (Array.isArray(lista) ? lista : []).map(normalizarEncargoBackend);
}

export async function listarPendientesApi() {
  if (!obtenerToken()) {
    return listarPendientes();
  }
  return await listarEncargosApi('Pendiente');
}

export async function cambiarEstadoApi(id, nuevoEstado) {
  if (!obtenerToken()) {
    return cambiarEstado(id, nuevoEstado);
  }
  const actualizado = await apiFetch(
    URLS.admin,
    `/api/admin/encargos/${encodeURIComponent(id)}/estado`,
    {
      method: 'PATCH',
      body: JSON.stringify({ estado: nuevoEstado }),
    }
  );
  return normalizarEncargoBackend(actualizado);
}

export async function resumenEncargosApi() {
  if (!obtenerToken()) {
    return resumenEncargos();
  }
  const encargos = await listarEncargosApi('todos');
  const resumen = { total: encargos.length };

  ESTADOS_ENCARGO.forEach((estado) => {
    resumen[estado] = encargos.filter((e) => e.estado === estado).length;
  });

  return resumen;
}