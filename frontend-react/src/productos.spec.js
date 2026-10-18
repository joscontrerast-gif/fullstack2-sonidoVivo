
import { obtenerProductos } from './services/productos.js';

describe('obtenerProductos', () => {
  let fetchOriginal;

  beforeEach(() => {
    fetchOriginal = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
  });

  it('debe devolver los productos cuando la respuesta es correcta', async () => {
    const productos = [
      { codigo: 'P001', nombre: 'Guitarra', precio: 150000 },
      { codigo: 'P002', nombre: 'Teclado', precio: 90000 }
    ];

    globalThis.fetch = jasmine.createSpy('fetch').and.resolveTo({
      ok: true,
      json: async () => productos
    });

    const resultado = await obtenerProductos();

    expect(globalThis.fetch).toHaveBeenCalledWith('/data/productos.json');
    expect(resultado).toEqual(productos);
  });

  it('debe lanzar un error cuando la respuesta no es correcta', async () => {
    globalThis.fetch = jasmine.createSpy('fetch').and.resolveTo({
      ok: false
    });

    await expectAsync(obtenerProductos())
      .toBeRejectedWithError('No se pudieron cargar los productos');
  });
});
