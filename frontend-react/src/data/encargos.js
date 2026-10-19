// Capa de datos de encargos (órdenes de compra).
// Comparte la clave "listaEncargos" con el flujo de compra del sitio original.

export const CLAVE_ENCARGOS = 'listaEncargos';

export const ESTADOS_ENCARGO = [
  'Pendiente',
  'En Proceso',
  'Completado',
  'Cancelado',
];

// Datos de prueba que se cargan si todavía no hay encargos guardados
export const ENCARGOS_INICIALES = [
  {
    id: 'ORD-001',
    fecha: '2026-03-10',
    cliente: 'Ana Torres',
    correo: 'ana@duoc.cl',
    total: 45990,
    estado: 'Pendiente',
  },
  {
    id: 'ORD-002',
    fecha: '2026-03-12',
    cliente: 'Juan Pérez',
    correo: 'juan@duoc.cl',
    total: 129900,
    estado: 'En Proceso',
  },
  {
    id: 'ORD-003',
    fecha: '2026-03-14',
    cliente: 'María Silva',
    correo: 'maria@duoc.cl',
    total: 24990,
    estado: 'Completado',
  },
];

export function guardarEncargos(encargos) {
  localStorage.setItem(CLAVE_ENCARGOS, JSON.stringify(encargos));
}

export function obtenerEncargos() {
  try {
    const datos = localStorage.getItem(CLAVE_ENCARGOS);
    const encargos = datos ? JSON.parse(datos) : null;

    if (Array.isArray(encargos)) {
      return encargos;
    }
  } catch {
    // Si los datos están corruptos se vuelve a los de prueba
  }

  const iniciales = ENCARGOS_INICIALES.map((encargo) => ({ ...encargo }));
  guardarEncargos(iniciales);

  return iniciales;
}

export function obtenerEncargoPorId(id) {
  return obtenerEncargos().find((encargo) => encargo.id === id) ?? null;
}

export function actualizarEstadoEncargo(id, nuevoEstado) {
  if (!ESTADOS_ENCARGO.includes(nuevoEstado)) {
    throw new Error(`El estado "${nuevoEstado}" no es válido.`);
  }

  const encargos = obtenerEncargos();
  const indice = encargos.findIndex((encargo) => encargo.id === id);

  if (indice === -1) {
    throw new Error(`No existe el encargo "${id}".`);
  }

  const actualizado = { ...encargos[indice], estado: nuevoEstado };
  const copia = [...encargos];
  copia[indice] = actualizado;
  guardarEncargos(copia);

  return actualizado;
}
