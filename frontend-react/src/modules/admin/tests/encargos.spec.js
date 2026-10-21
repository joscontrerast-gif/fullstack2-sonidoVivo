import {
  CLAVE_ENCARGOS,
  ENCARGOS_INICIALES,
  ESTADOS_ENCARGO,
  actualizarEstadoEncargo,
  guardarEncargos,
  obtenerEncargoPorId,
  obtenerEncargos,
} from '../../../data/encargos.js';
import {
  cambiarEstado,
  detalleEncargo,
  formatearTotal,
  listarEncargos,
  listarPendientes,
  resumenEncargos,
  textoEntrega,
} from '../services/encargosService.js';

function encargosGuardados() {
  return JSON.parse(localStorage.getItem(CLAVE_ENCARGOS));
}

// ---------------------------------------------------------------------------
// 1. Capa de datos de encargos
// ---------------------------------------------------------------------------

describe('Capa de datos de encargos', () => {
  it('define los cuatro estados posibles', () => {
    expect(ESTADOS_ENCARGO).toEqual([
      'Pendiente',
      'En Proceso',
      'Completado',
      'Cancelado',
    ]);
  });

  describe('obtenerEncargos', () => {
    it('carga los encargos de prueba y los guarda si no hay datos', () => {
      const encargos = obtenerEncargos();

      expect(encargos.length).toBe(3);
      expect(encargosGuardados().length).toBe(3);
    });

    it('no modifica los encargos de prueba originales', () => {
      obtenerEncargos()[0].estado = 'Cancelado';

      expect(ENCARGOS_INICIALES[0].estado).toBe('Pendiente');
    });

    it('usa lo que ya está guardado', () => {
      guardarEncargos([{ id: 'ORD-100', estado: 'Pendiente' }]);

      expect(obtenerEncargos()).toEqual([{ id: 'ORD-100', estado: 'Pendiente' }]);
    });

    it('vuelve a los datos de prueba si lo guardado está corrupto', () => {
      localStorage.setItem(CLAVE_ENCARGOS, 'esto no es json');

      expect(obtenerEncargos().length).toBe(3);
    });

    it('vuelve a los datos de prueba si lo guardado no es una lista', () => {
      localStorage.setItem(CLAVE_ENCARGOS, '{"id":"ORD-1"}');

      expect(obtenerEncargos().length).toBe(3);
    });
  });

  describe('obtenerEncargoPorId', () => {
    it('encuentra un encargo existente', () => {
      expect(obtenerEncargoPorId('ORD-002').cliente).toBe('Juan Pérez');
    });

    it('devuelve null si no existe', () => {
      expect(obtenerEncargoPorId('ORD-999')).toBeNull();
    });
  });

  describe('actualizarEstadoEncargo', () => {
    it('cambia el estado y lo guarda', () => {
      const actualizado = actualizarEstadoEncargo('ORD-001', 'Completado');

      expect(actualizado.estado).toBe('Completado');
      expect(
        encargosGuardados().find((e) => e.id === 'ORD-001').estado
      ).toBe('Completado');
    });

    it('rechaza un estado que no existe', () => {
      expect(() => actualizarEstadoEncargo('ORD-001', 'Perdido')).toThrowError(
        'El estado "Perdido" no es válido.'
      );
    });

    it('falla si el encargo no existe', () => {
      expect(() => actualizarEstadoEncargo('ORD-999', 'Completado')).toThrowError(
        'No existe el encargo "ORD-999".'
      );
    });
  });
});

// ---------------------------------------------------------------------------
// 2. Servicio de encargos
// ---------------------------------------------------------------------------

describe('Servicio de encargos', () => {
  const ids = (lista) => lista.map((encargo) => encargo.id);

  it('listarEncargos muestra primero los más recientes', () => {
    expect(ids(listarEncargos())).toEqual(['ORD-003', 'ORD-002', 'ORD-001']);
  });

  it('listarEncargos filtra por estado', () => {
    expect(ids(listarEncargos('Pendiente'))).toEqual(['ORD-001']);
    expect(ids(listarEncargos('todos')).length).toBe(3);
    expect(listarEncargos('Cancelado')).toEqual([]);
  });

  it('listarPendientes devuelve solo los pendientes', () => {
    expect(ids(listarPendientes())).toEqual(['ORD-001']);
  });

  it('cambiarEstado actualiza y guarda el encargo', () => {
    const actualizado = cambiarEstado('ORD-002', 'Cancelado');

    expect(actualizado.estado).toBe('Cancelado');
    expect(ids(listarEncargos('Cancelado'))).toEqual(['ORD-002']);
  });

  it('detalleEncargo devuelve el encargo o null', () => {
    expect(detalleEncargo('ORD-003').correo).toBe('maria@duoc.cl');
    expect(detalleEncargo('ORD-999')).toBeNull();
  });

  it('formatearTotal muestra pesos chilenos y trata valores vacíos como 0', () => {
    expect(formatearTotal(45990)).toMatch(/45\.990/);
    expect(formatearTotal(0)).toMatch(/0/);
    expect(formatearTotal(undefined)).toMatch(/0/);
  });

  it('textoEntrega traduce el tipo de entrega', () => {
    expect(textoEntrega('retiro')).toBe('Retiro en tienda');
    expect(textoEntrega('despacho')).toBe('Despacho a domicilio');
    expect(textoEntrega(undefined)).toBe('No informado');
  });

  it('resumenEncargos cuenta el total y los encargos de cada estado', () => {
    expect(resumenEncargos()).toEqual({
      total: 3,
      Pendiente: 1,
      'En Proceso': 1,
      Completado: 1,
      Cancelado: 0,
    });
  });

  it('resumenEncargos refleja los cambios de estado', () => {
    cambiarEstado('ORD-001', 'Cancelado');

    expect(resumenEncargos().Pendiente).toBe(0);
    expect(resumenEncargos().Cancelado).toBe(1);
  });
});
