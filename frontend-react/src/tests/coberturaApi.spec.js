import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  URLS,
  apiFetch,
  guardarSesion,
  limpiarSesion,
  obtenerToken,
  obtenerUsuarioGuardado,
} from '../services/api.js';
import {
  cerrarSesion,
  iniciarSesion,
  obtenerComunas,
  obtenerPerfilActual,
  obtenerRegiones,
  registrarUsuario,
} from '../services/auth.js';
import {
  obtenerCategorias,
  obtenerProductoPorCodigo,
  obtenerProductos,
} from '../services/productos.js';
import { CLAVE_PRODUCTOS } from '../data/productos.js';
import {
  agregarAlCarritoApi,
  cambiarCantidadApi,
  contarItemsCarrito,
  eliminarDelCarritoApi,
  guardarCarrito,
  obtenerCarritoApi,
  vaciarCarritoApi,
} from '../services/carrito.js';
import {
  confirmarCompra,
  construirResumen,
  formatoPrecio,
  obtenerCostoEntrega,
  validarCarrito,
  validarDatosEnvio,
} from '../modules/compra/services/compraService.js';
import {
  borrarProducto,
  calcularResumen,
  esStockCritico,
  filtrarProductos,
  formatearPrecio,
  guardarProducto,
  listarProductos,
  validarProducto,
} from '../modules/admin/services/adminService.js';
import FormularioProducto from '../modules/admin/components/FormularioProducto.jsx';
import TablaProductos from '../modules/admin/components/TablaProductos.jsx';
import {
  cambiarEstadoApi,
  listarEncargosApi,
  listarPendientesApi,
  resumenEncargosApi,
  textoEntrega,
} from '../modules/admin/services/encargosService.js';
import {
  borrarPersonaApi,
  esDelTipo,
  estadoDe,
  filtrarEmpleados,
  guardarPersonaApi,
  listarPersonasApi,
  rolDe,
  validarPersona,
} from '../modules/admin/services/personasService.js';
import {
  calcularDigitoVerificador,
  validarConfirmacion,
  validarContrasena,
  validarCorreo,
  validarRun,
  validarSeleccion,
  validarTexto,
} from '../modules/admin/services/validaciones.js';

function crearRespuesta({
  ok = true,
  status = 200,
  body = null,
  usarJson = false,
  sinMetodos = false,
} = {}) {
  if (sinMetodos) {
    return Promise.resolve({ ok, status });
  }
  if (usarJson) {
    return Promise.resolve({
      ok,
      status,
      json: async () => body,
    });
  }
  return Promise.resolve({
    ok,
    status,
    text: async () =>
      body === null
        ? ''
        : typeof body === 'string'
        ? body
        : JSON.stringify(body),
  });
}

describe('Cobertura completa de servicios y ramas API', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('api.js', () => {
    it('gestiona sesión y maneja JSON inválido en obtenerUsuarioGuardado', () => {
      expect(obtenerToken()).toBeNull();
      expect(obtenerUsuarioGuardado()).toBeNull();

      guardarSesion('tok-123', { nombre: 'Ana' });
      expect(obtenerToken()).toBe('tok-123');
      expect(obtenerUsuarioGuardado()).toEqual({ nombre: 'Ana' });

      localStorage.setItem('sonidovivo_usuario', '{json-roto');
      expect(obtenerUsuarioGuardado()).toBeNull();

      limpiarSesion();
      expect(obtenerToken()).toBeNull();
    });

    it('maneja respuestas 204, texto plano, .json() y sin métodos de lectura', async () => {
      const fetchSpy = spyOn(window, 'fetch');

      fetchSpy.and.returnValue(crearRespuesta({ status: 204 }));
      expect(await apiFetch(URLS.auth, '/204')).toBeNull();

      guardarSesion('tok-abc', { id: 1 });
      fetchSpy.and.returnValue(crearRespuesta({ body: 'texto-plano' }));
      expect(
        await apiFetch(URLS.auth, '/texto', {
          method: 'POST',
          body: JSON.stringify({ a: 1 }),
          headers: { 'X-Test': '1' },
        })
      ).toBe('texto-plano');

      fetchSpy.and.returnValue(crearRespuesta({ body: null }));
      expect(await apiFetch(URLS.auth, '/vacio')).toBeNull();

      fetchSpy.and.returnValue(
        crearRespuesta({ usarJson: true, body: { ok: 1 } })
      );
      expect(await apiFetch(URLS.auth, '/json')).toEqual({ ok: 1 });

      fetchSpy.and.returnValue(crearRespuesta({ sinMetodos: true }));
      expect(await apiFetch(URLS.auth, '/sin-metodos')).toBeNull();
    });

    it('lanza errores con mensaje desde mensaje, message, error, texto o código HTTP', async () => {
      const fetchSpy = spyOn(window, 'fetch');

      fetchSpy.and.returnValue(
        crearRespuesta({ ok: false, status: 400, body: { mensaje: 'Fallo 1' } })
      );
      await expectAsync(apiFetch(URLS.auth, '/e1')).toBeRejectedWithError('Fallo 1');

      fetchSpy.and.returnValue(
        crearRespuesta({ ok: false, status: 401, body: { message: 'Fallo 2' } })
      );
      await expectAsync(apiFetch(URLS.auth, '/e2')).toBeRejectedWithError('Fallo 2');

      fetchSpy.and.returnValue(
        crearRespuesta({ ok: false, status: 403, body: { error: 'Fallo 3' } })
      );
      await expectAsync(apiFetch(URLS.auth, '/e3')).toBeRejectedWithError('Fallo 3');

      fetchSpy.and.returnValue(
        crearRespuesta({ ok: false, status: 422, body: 'Error texto' })
      );
      await expectAsync(apiFetch(URLS.auth, '/e4')).toBeRejectedWithError('Error texto');

      fetchSpy.and.returnValue(
        crearRespuesta({ ok: false, status: 500, body: null })
      );
      await expectAsync(apiFetch(URLS.auth, '/e5')).toBeRejectedWithError('Error HTTP 500');
    });
  });

  describe('auth.js', () => {
    it('ejecuta login, registro, perfil, regiones, comunas y cierre de sesión', async () => {
      const fetchSpy = spyOn(window, 'fetch');

      fetchSpy.and.returnValue(
        crearRespuesta({
          body: { token: 'jwt-1', usuario: { correo: 'a@duoc.cl' } },
        })
      );
      const loginRes = await iniciarSesion('a@duoc.cl', '123456');
      expect(loginRes.token).toBe('jwt-1');
      expect(obtenerToken()).toBe('jwt-1');

      fetchSpy.and.returnValue(crearRespuesta({ body: { id: 2 } }));
      expect(await registrarUsuario({ nombre: 'Test' })).toEqual({ id: 2 });

      fetchSpy.and.returnValue(crearRespuesta({ body: { correo: 'a@duoc.cl' } }));
      expect(await obtenerPerfilActual()).toEqual({ correo: 'a@duoc.cl' });

      fetchSpy.and.returnValue(crearRespuesta({ body: [{ id: 1, nombre: 'RM' }] }));
      expect((await obtenerRegiones()).length).toBe(1);

      fetchSpy.and.returnValue(crearRespuesta({ body: [{ id: 10, nombre: 'Concón' }] }));
      expect((await obtenerComunas(5)).length).toBe(1);

      cerrarSesion();
      expect(obtenerToken()).toBeNull();
    });
  });

  describe('productos.js', () => {
    it('cubre localStorage, fetch público y endpoints con token y filtros', async () => {
      localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify([{ codigo: 'P1', nombre: 'Local' }])
      );
      const locales = await obtenerProductos();
      expect(locales[0].codigo).toBe('P1');
      localStorage.removeItem(CLAVE_PRODUCTOS);

      const fetchSpy = spyOn(window, 'fetch');
      fetchSpy.and.returnValue(
        crearRespuesta({ ok: false, status: 500, usarJson: true })
      );
      await expectAsync(obtenerProductos()).toBeRejectedWithError(
        'No se pudieron cargar los productos'
      );

      guardarSesion('tok-prod', { rol: 'Administrador' });
      fetchSpy.and.returnValue(crearRespuesta({ body: [{ codigo: 'API1' }] }));
      expect((await obtenerProductos()).length).toBe(1);

      fetchSpy.and.returnValue(crearRespuesta({ body: [{ codigo: 'API2' }] }));
      expect(
        (
          await obtenerProductos({
            todos: true,
            q: 'fender',
            categoria: 'Guitarras',
          })
        ).length
      ).toBe(1);

      fetchSpy.and.returnValue(crearRespuesta({ body: { codigo: 'API1' } }));
      expect((await obtenerProductoPorCodigo('API1')).codigo).toBe('API1');

      fetchSpy.and.returnValue(crearRespuesta({ body: ['Guitarras'] }));
      expect(await obtenerCategorias()).toEqual(['Guitarras']);
    });
  });

  describe('carrito.js y compraService.js', () => {
    it('cubre funciones API de carrito en éxito y error, contador y ramas de compraService', async () => {
      expect(contarItemsCarrito(null)).toBe(0);
      expect(contarItemsCarrito([{ cantidad: 2 }, { cantidad: 0 }])).toBe(2);

      guardarCarrito([{ codigo: 'GTR001', cantidad: 1 }]);
      expect((await agregarAlCarritoApi('GTR001')).exito).toBeTrue();
      expect((await cambiarCantidadApi('GTR001', 2)).exito).toBeTrue();
      expect(await eliminarDelCarritoApi('GTR001')).toEqual([]);
      expect(await vaciarCarritoApi()).toEqual([]);

      guardarSesion('tok-car', { id: 1 });
      const fetchSpy = spyOn(window, 'fetch');

      fetchSpy.and.returnValue(
        crearRespuesta({ body: [{ codigo: 'GTR001', cantidad: 2 }] })
      );
      expect((await obtenerCarritoApi()).length).toBe(1);

      fetchSpy.and.returnValue(
        crearRespuesta({ body: [{ codigo: 'GTR001', cantidad: 3 }] })
      );
      expect((await agregarAlCarritoApi('GTR001', 1, 5)).exito).toBeTrue();

      fetchSpy.and.returnValue(
        crearRespuesta({ ok: false, status: 400, body: { mensaje: 'Sin stock' } })
      );
      expect((await agregarAlCarritoApi('GTR001', 1, 5)).exito).toBeFalse();

      fetchSpy.and.returnValue(
        crearRespuesta({ body: [{ codigo: 'GTR001', cantidad: 4 }] })
      );
      expect((await cambiarCantidadApi('GTR001', 4, 5)).exito).toBeTrue();

      fetchSpy.and.returnValue(
        crearRespuesta({ ok: false, status: 400, body: { mensaje: 'Inválida' } })
      );
      expect((await cambiarCantidadApi('GTR001', 9, 5)).exito).toBeFalse();

      fetchSpy.and.returnValue(crearRespuesta({ body: [] }));
      expect(await eliminarDelCarritoApi('GTR001')).toEqual([]);

      fetchSpy.and.returnValue(crearRespuesta({ status: 204 }));
      const compraApi = await confirmarCompra(
        [{ codigo: 'GTR001', nombre: 'Guitarra', precio: 1000, cantidad: 1, stock: 5 }],
        { direccion: 'Av. Libertad 123', comuna: 'Viña del Mar', entrega: 'desconocida' }
      );
      expect(compraApi.ok).toBeTrue();

      expect(formatoPrecio(null)).toContain('0');
      expect(obtenerCostoEntrega('otro')).toBe(1990);
      expect(
        construirResumen([], {
          direccion: 'Calle 123',
          comuna: 'Concón',
          entrega: 'otro',
        }).entrega
      ).toBe('Entrega estándar');
      expect(validarDatosEnvio({}).direccion).toBeDefined();
      expect(
        validarCarrito([{ nombre: 'Test', cantidad: 0, stock: 5 }])
      ).toContain('supera el stock');
    });
  });

  describe('adminService.js, encargosService.js, personasService.js y validaciones.js', () => {
    it('cubre ramas de adminService con token activo y helpers', async () => {
      expect(validarProducto().valido).toBeFalse();

      const valNum = validarProducto({
        codigo: 'PRD01',
        nombre: 'Bajo',
        marca: 'Fender',
        modelo: 'Jazz',
        descripcion: 'Desc',
        categoria: 'Bajos Eléctricos',
        precio: 250000,
        stock: 3,
        stockCritico: 3,
      });
      expect(valNum.valido).toBeTrue();
      expect(esStockCritico({ stock: 3, stockCritico: 3 })).toBeTrue();
      expect(esStockCritico({ stock: 5, stockCritico: null })).toBeFalse();
      expect(formatearPrecio(0)).toBe('FREE');
      expect(formatearPrecio(null)).toBe('FREE');
      expect(filtrarProductos([])).toEqual([]);
      expect(
        filtrarProductos([{ codigo: 'X1', categoria: 'Accesorios' }], {
          busqueda: 'inexistente',
        })
      ).toEqual([]);
      expect(
        calcularResumen([{ stock: 0, stockCritico: 1 }]).sinStock
      ).toBe(1);

      guardarSesion('tok-adm', { rol: 'Administrador' });
      const fetchSpy = spyOn(window, 'fetch');

      fetchSpy.and.returnValue(
        crearRespuesta({ body: [{ codigo: 'PRD01', nombre: 'Bajo' }] })
      );
      expect((await listarProductos()).length).toBe(1);

      fetchSpy.and.returnValues(
        crearRespuesta({ body: [] }),
        crearRespuesta({ body: { codigo: 'PRD02', nombre: 'Teclado' } })
      );
      const creado = await guardarProducto({
        codigo: 'PRD02',
        nombre: 'Teclado',
        categoria: 'Teclados y Pianos',
        precio: 150000,
        stock: 4,
      });
      expect(creado.ok).toBeTrue();

      fetchSpy.and.returnValues(
        crearRespuesta({ body: [{ codigo: 'PRD02' }] }),
        crearRespuesta({ body: { codigo: 'PRD02', nombre: 'Teclado Pro' } })
      );
      const editado = await guardarProducto(
        {
          nombre: 'Teclado Pro',
          categoria: 'Teclados y Pianos',
          precio: 180000,
          stock: 4,
        },
        'PRD02'
      );
      expect(editado.ok).toBeTrue();

      fetchSpy.and.returnValue(crearRespuesta({ status: 204 }));
      expect(await borrarProducto('PRD02')).toBeNull();
    });

    it('cubre ramas de encargosService con y sin token', async () => {
      expect(textoEntrega(null)).toBe('No informado');
      expect(textoEntrega('Retiro en tienda')).toBe('Retiro en tienda');
      expect(textoEntrega('Despacho')).toBe('Despacho a domicilio');

      const encargosLocales = await listarEncargosApi();
      expect(Array.isArray(encargosLocales)).toBeTrue();
      if (encargosLocales.length > 0) {
        expect(
          (await cambiarEstadoApi(encargosLocales[0].id, 'Completado')).estado
        ).toBe('Completado');
      }
      expect(Array.isArray(await listarPendientesApi())).toBeTrue();
      expect((await resumenEncargosApi()).total).toBeGreaterThanOrEqual(0);

      guardarSesion('tok-enc', { rol: 'Administrador' });
      const fetchSpy = spyOn(window, 'fetch');

      fetchSpy.and.returnValue(
        crearRespuesta({
          body: [
            { id: 'ORD-1', estado: 'Pendiente', fecha: '2026-03-10T10:00:00Z' },
            { id: 'ORD-2', estado: 'Completado', fecha: null },
          ],
        })
      );
      const lista = await listarEncargosApi();
      expect(lista.length).toBe(2);

      fetchSpy.and.returnValue(crearRespuesta({ body: null }));
      expect(await listarPendientesApi()).toEqual([]);

      fetchSpy.and.returnValue(
        crearRespuesta({
          body: { id: 'ORD-1', estado: 'Completado', fecha: null },
        })
      );
      const actualizado = await cambiarEstadoApi('ORD-1', 'Completado');
      expect(actualizado.estado).toBe('Completado');

      fetchSpy.and.returnValue(
        crearRespuesta({
          body: [{ id: 'ORD-1', estado: 'Pendiente', fecha: null }],
        })
      );
      const resumen = await resumenEncargosApi();
      expect(resumen.total).toBe(1);
    });

    it('cubre ramas de personasService y validaciones.js', async () => {
      expect(esDelTipo({ tipo: 'Cliente' }, 'cliente')).toBeTrue();
      expect(esDelTipo({ tipo: 'Vendedor' }, 'empleado')).toBeTrue();
      expect(filtrarEmpleados([])).toEqual([]);
      expect(
        filtrarEmpleados(
          [{ tipoUsuario: 'Administrador' }, { tipo: 'Administrador' }],
          'Administrador'
        ).length
      ).toBe(2);
      expect(
        filtrarEmpleados(
          [{ tipoUsuario: 'Empleado' }, { tipo: 'Vendedor' }],
          'Empleado'
        ).length
      ).toBe(2);
      expect(estadoDe({ estado: 'Inactivo' })).toBe('Inactivo');
      expect(estadoDe({})).toBe('Activo');
      expect(rolDe({ rol: 'Admin' })).toBe('Admin');
      expect(rolDe({ tipoUsuario: 'Cliente' })).toBe('Cliente');
      expect(rolDe({ tipo: 'Vendedor' })).toBe('Vendedor');
      expect(rolDe({})).toBe('');

      expect(validarPersona().valido).toBeFalse();
      expect(
        validarPersona(
          {
            run: '11111111-1',
            nombre: 'Ana',
            apellidos: 'Soto',
            correo: 'ana@duoc.cl',
            rol: 'Invalido',
            region: 'RM',
            comuna: 'Santiago',
            direccion: 'Calle 123',
            contrasena: 'password123',
            confirmarContrasena: 'password123',
          },
          {
            tipo: 'empleado',
            modo: 'crear',
            existentes: [{ run: '22222222-2', correo: null }],
          }
        ).errores.rol
      ).toBeDefined();
      expect(
        validarPersona(
          {
            nombre: 'Ana',
            apellidos: 'Soto',
            correo: 'ana@duoc.cl',
            region: 'RM',
            comuna: 'Santiago',
            direccion: 'Calle 123',
          },
          {
            modo: 'editar',
            existentes: [{ run: '22222222-2', correo: null }],
            claveOriginal: null,
          }
        ).valido
      ).toBeTrue();

      expect(Array.isArray(await listarPersonasApi('cliente'))).toBeTrue();
      expect((await guardarPersonaApi({}, 'cliente')).ok).toBeFalse();
      expect(
        (
          await guardarPersonaApi({}, 'cliente', {
            run: '11111111-1',
            correo: 'a@duoc.cl',
          })
        ).ok
      ).toBeFalse();
      await expectAsync(
        borrarPersonaApi({ run: '99999999-9', correo: 'x@duoc.cl' })
      ).toBeRejected();

      expect(validarTexto(null, 'Campo')).toContain('obligatorio');
      expect(validarTexto('abc', 'Campo')).toBeNull();
      expect(validarSeleccion(null, 'opción')).toContain('Debes seleccionar');
      expect(validarSeleccion('ok', 'opción')).toBeNull();
      expect(validarCorreo(null)).toContain('obligatorio');
      expect(validarCorreo('x@duoc.cl')).toBeNull();
      expect(calcularDigitoVerificador('11111111')).toBe('1');
      expect(validarRun('11111111-1')).toBeNull();
      expect(validarContrasena(null)).toContain('obligatoria');
      expect(validarContrasena('', { obligatoria: false })).toBeNull();
      expect(validarContrasena('123456')).toBeNull();
      expect(validarConfirmacion(null, null)).toContain('confirmar');
      expect(validarConfirmacion('', '', { obligatoria: false })).toBeNull();
      expect(validarConfirmacion('123456', '123456')).toBeNull();

      guardarSesion('tok-per', { rol: 'Administrador' });
      const fetchSpy = spyOn(window, 'fetch');

      fetchSpy.and.returnValue(
        crearRespuesta({
          body: [
            { id: 1, tipo: 'Cliente', fechaRegistro: '2026-03-10T10:00:00Z' },
            { id: 2, tipo: 'Cliente', fechaRegistro: null },
          ],
        })
      );
      expect((await listarPersonasApi('cliente')).length).toBe(2);

      fetchSpy.and.returnValue(crearRespuesta({ body: null }));
      expect(await listarPersonasApi('empleado')).toEqual([]);

      const invalidaApi = await guardarPersonaApi({}, 'cliente');
      expect(invalidaApi.ok).toBeFalse();

      fetchSpy.and.returnValue(
        crearRespuesta({
          body: { id: 10, tipo: 'Cliente', fechaRegistro: null },
        })
      );
      const creadoApi = await guardarPersonaApi(
        {
          run: '11111111-1',
          nombre: 'Juan',
          apellidos: 'Pérez',
          correo: 'juan@duoc.cl',
          region: 'Valparaíso',
          comuna: 'Concón',
          idComuna: '5',
          direccion: 'Calle 123',
          contrasena: 'password123',
          confirmarContrasena: 'password123',
        },
        'cliente'
      );
      expect(creadoApi.ok).toBeTrue();

      fetchSpy.and.returnValue(
        crearRespuesta({
          body: { id: 20, tipo: 'Administrador', fechaRegistro: '2026-03-11' },
        })
      );
      const editadoApi = await guardarPersonaApi(
        {
          nombre: 'Laura',
          apellidos: 'Gómez',
          correo: 'laura@duoc.cl',
          rol: 'Administrador',
          region: 'Valparaíso',
          comuna: 'Concón',
          direccion: 'Av. Borgoño 100',
          contrasena: '',
          confirmarContrasena: '',
        },
        'empleado',
        { id: 20, estado: 'Inactivo' }
      );
      expect(editadoApi.ok).toBeTrue();

      fetchSpy.and.returnValue(crearRespuesta({ status: 204 }));
      expect(
        await borrarPersonaApi({
          id: 20,
          run: '11111111-1',
          nombre: 'Laura',
          apellidos: 'Gómez',
          correo: 'laura@duoc.cl',
          tipo: 'Administrador',
          idComuna: 5,
          direccion: 'Av. Borgoño 100',
        })
      ).toBeNull();

      fetchSpy.and.returnValue(crearRespuesta({ status: 204 }));
      expect(
        await borrarPersonaApi({
          id: 21,
          nombre: 'SinDatos',
          correo: 'sin@duoc.cl',
          tipoUsuario: 'Cliente',
        })
      ).toBeNull();
    });

    it('cubre validación y renderizado de imagen en FormularioProducto y TablaProductos', async () => {
      const valImgLarga = validarProducto({
        codigo: 'PRD99',
        nombre: 'Guitarra',
        categoria: 'Accesorios',
        imagen: 'x'.repeat(501),
        precio: 1000,
        stock: 1,
      });
      expect(valImgLarga.valido).toBeFalse();
      expect(valImgLarga.errores.imagen).toBeDefined();

      globalThis.IS_REACT_ACT_ENVIRONMENT = true;
      const contenedor = document.createElement('div');
      document.body.appendChild(contenedor);
      const root = createRoot(contenedor);

      await act(async () => {
        root.render(
          createElement(TablaProductos, {
            productos: [
              {
                codigo: 'IMG01',
                nombre: 'Con Imagen',
                categoria: 'Accesorios',
                precio: 1000,
                stock: 5,
                imagen: '/img/productos/GA001.svg',
              },
              {
                codigo: 'IMG02',
                nombre: 'Sin Imagen',
                categoria: 'Accesorios',
                precio: 1000,
                stock: 5,
              },
            ],
            onEditar: () => {},
            onEliminar: () => {},
          })
        );
      });
      expect(contenedor.querySelectorAll('img').length).toBe(1);

      await act(async () => {
        root.render(
          createElement(FormularioProducto, {
            productoInicial: {
              codigo: 'IMG01',
              nombre: 'Guitarra',
              categoria: 'Accesorios',
              precio: 1000,
              stock: 5,
              imagen: 'x'.repeat(501),
            },
            categorias: ['Accesorios'],
            onGuardar: (vals) => validarProducto(vals, { modo: 'editar' }),
            onCancelar: () => {},
          })
        );
      });

      const form = contenedor.querySelector('form');
      await act(async () => {
        form.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        );
      });
      expect(contenedor.querySelector('#imagen-error')).not.toBeNull();

      await act(async () => {
        root.unmount();
      });
      contenedor.remove();
    });
  });
});