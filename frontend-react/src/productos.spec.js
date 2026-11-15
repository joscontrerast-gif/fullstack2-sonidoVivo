
import { URL_ADMIN } from './api/config.js';
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

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${URL_ADMIN}/api/productos`,
      jasmine.objectContaining({ method: 'GET' })
    );
    expect(resultado).toEqual(productos);
  });

  it('debe lanzar un error cuando la respuesta no es correcta', async () => {
    globalThis.fetch = jasmine.createSpy('fetch').and.resolveTo({
      ok: false
    });

    await expectAsync(obtenerProductos())
      .toBeRejectedWithError('No se pudieron cargar los productos');
  });

  it('debe lanzar el mismo error cuando no hay conexión con el servidor', async () => {
    globalThis.fetch = jasmine
      .createSpy('fetch')
      .and.rejectWith(new TypeError('Failed to fetch'));

    await expectAsync(obtenerProductos())
      .toBeRejectedWithError('No se pudieron cargar los productos');
  });
});
