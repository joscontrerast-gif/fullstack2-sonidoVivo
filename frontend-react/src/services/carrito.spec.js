
import {
  obtenerCarrito,
  guardarCarrito,
  agregarAlCarrito,
  cambiarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
} from './carrito.js';

describe('Servicio del carrito', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('obtenerCarrito', () => {
    it('debe devolver un array vacío si no hay carrito guardado', () => {
      expect(obtenerCarrito()).toEqual([]);
    });

    it('debe devolver los productos guardados', () => {
      const carrito = [{ codigo: 'P001', cantidad: 2 }];

      guardarCarrito(carrito);

      expect(obtenerCarrito()).toEqual(carrito);
    });

    it('debe devolver un array vacío si los datos guardados no son un array', () => {
      localStorage.setItem('carritoSonidoVivo', '{"codigo":"P001"}');

      expect(obtenerCarrito()).toEqual([]);
    });

    it('debe devolver un array vacío si los datos guardados son JSON inválidos', () => {
      localStorage.setItem('carritoSonidoVivo', '{datos incorrectos');

      expect(obtenerCarrito()).toEqual([]);
    });
  });

  describe('agregarAlCarrito', () => {
    it('debe agregar un producto nuevo con cantidad 1', () => {
      const resultado = agregarAlCarrito('P001', 5);

      expect(resultado.exito).toBeTrue();
      expect(resultado.carrito).toEqual([
        { codigo: 'P001', cantidad: 1 },
      ]);
      expect(obtenerCarrito()).toEqual(resultado.carrito);
    });

    it('debe aumentar la cantidad si el producto ya existe', () => {
      guardarCarrito([{ codigo: 'P001', cantidad: 1 }]);

      const resultado = agregarAlCarrito('P001', 5);

      expect(resultado.exito).toBeTrue();
      expect(resultado.carrito).toEqual([
        { codigo: 'P001', cantidad: 2 },
      ]);
    });

    it('no debe agregar productos si no hay stock', () => {
      const resultado = agregarAlCarrito('P001', 0);

      expect(resultado.exito).toBeFalse();
      expect(resultado.carrito).toEqual([]);
    });

    it('no debe superar el stock disponible', () => {
      guardarCarrito([{ codigo: 'P001', cantidad: 2 }]);

      const resultado = agregarAlCarrito('P001', 2);

      expect(resultado.exito).toBeFalse();
      expect(resultado.carrito).toEqual([
        { codigo: 'P001', cantidad: 2 },
      ]);
    });
  });

  describe('cambiarCantidad', () => {
    beforeEach(() => {
      guardarCarrito([{ codigo: 'P001', cantidad: 2 }]);
    });

    it('debe actualizar la cantidad de un producto', () => {
      const resultado = cambiarCantidad('P001', 4, 5);

      expect(resultado.exito).toBeTrue();
      expect(resultado.carrito[0].cantidad).toBe(4);
      expect(obtenerCarrito()[0].cantidad).toBe(4);
    });

    it('debe rechazar cantidades inferiores a 1', () => {
      const resultado = cambiarCantidad('P001', 0, 5);

      expect(resultado.exito).toBeFalse();
      expect(obtenerCarrito()[0].cantidad).toBe(2);
    });

    it('debe rechazar cantidades superiores al stock', () => {
      const resultado = cambiarCantidad('P001', 6, 5);

      expect(resultado.exito).toBeFalse();
      expect(obtenerCarrito()[0].cantidad).toBe(2);
    });

    it('debe rechazar productos que no existen', () => {
      const resultado = cambiarCantidad('P999', 1, 5);

      expect(resultado.exito).toBeFalse();
      expect(resultado.mensaje).toBe('Producto no encontrado.');
    });

    it('debe rechazar cantidades que no son números válidos', () => {
      const resultado = cambiarCantidad('P001', 'abc', 5);

      expect(resultado.exito).toBeFalse();
      expect(obtenerCarrito()[0].cantidad).toBe(2);
    });
  });

  describe('eliminarDelCarrito', () => {
    it('debe eliminar el producto indicado', () => {
      guardarCarrito([
        { codigo: 'P001', cantidad: 1 },
        { codigo: 'P002', cantidad: 2 },
      ]);

      const resultado = eliminarDelCarrito('P001');

      expect(resultado).toEqual([
        { codigo: 'P002', cantidad: 2 },
      ]);
      expect(obtenerCarrito()).toEqual(resultado);
    });
  });

  describe('vaciarCarrito', () => {
    it('debe eliminar el carrito guardado', () => {
      guardarCarrito([{ codigo: 'P001', cantidad: 1 }]);

      vaciarCarrito();

      expect(obtenerCarrito()).toEqual([]);
    });
  });
});
