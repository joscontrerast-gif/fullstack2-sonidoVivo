import { catalogoApi } from './catalogoApi.js';
import { authApi, ubicacionesApi } from './authApi.js';
import {
  dashboardApi,
  encargosApi,
  productosApi,
  usuariosApi,
} from './adminApi.js';
import { URL_ADMIN, URL_AUTH } from './config.js';
import { ErrorApi, EVENTO_SESION_EXPIRADA, peticion } from './http.js';
import {
  CLAVE_SESION,
  borrarSesion,
  guardarSesion,
  leerSesion,
  obtenerToken,
} from './sesion.js';

// Respuesta falsa de fetch
function respuesta(datos, { ok = true, status = 200 } = {}) {
  return Promise.resolve({
    ok,
    status,
    json: async () => {
      if (datos === undefined) {
        throw new Error('sin cuerpo');
      }

      return datos;
    },
  });
}

describe('Sesión', () => {
  const RESPUESTA_LOGIN = {
    token: 'abc.def.ghi',
    expiraEnSegundos: 3600,
    usuario: { id: 1, nombre: 'Admin', rol: 'ADMINISTRADOR' },
  };

  it('no hay sesión si no se ha iniciado', () => {
    expect(leerSesion()).toBeNull();
    expect(obtenerToken()).toBeNull();
  });

  it('guarda y lee la sesión con su token y su usuario', () => {
    guardarSesion(RESPUESTA_LOGIN);

    expect(leerSesion().usuario.nombre).toBe('Admin');
    expect(obtenerToken()).toBe('abc.def.ghi');
  });

  it('borrarSesion elimina la sesión', () => {
    guardarSesion(RESPUESTA_LOGIN);
    borrarSesion();

    expect(leerSesion()).toBeNull();
  });

  it('una sesión vencida se descarta', () => {
    localStorage.setItem(
      CLAVE_SESION,
      JSON.stringify({
        token: 'x',
        usuario: { id: 1 },
        expiraEn: Date.now() - 1000,
      })
    );

    expect(leerSesion()).toBeNull();
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it('una sesión sin token o con datos corruptos se ignora', () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ usuario: { id: 1 } }));
    expect(leerSesion()).toBeNull();

    localStorage.setItem(CLAVE_SESION, '{no es json');
    expect(leerSesion()).toBeNull();
  });

  it('una sesión sin fecha de expiración no vence sola', () => {
    guardarSesion({ token: 't', usuario: { id: 1 } });

    expect(leerSesion().expiraEn).toBeNull();
    expect(obtenerToken()).toBe('t');
  });
});

describe('Cliente HTTP (peticion)', () => {
  let fetchOriginal;

  beforeEach(() => {
    fetchOriginal = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
  });

  function simularFetch(...respuestas) {
    globalThis.fetch = jasmine
      .createSpy('fetch')
      .and.returnValues(...respuestas);

    return globalThis.fetch;
  }

  it('hace un GET y devuelve el JSON', async () => {
    const fetchFalso = simularFetch(respuesta([{ id: 1 }]));

    const datos = await peticion('http://api', '/datos');

    expect(datos).toEqual([{ id: 1 }]);
    expect(fetchFalso).toHaveBeenCalledWith(
      'http://api/datos',
      jasmine.objectContaining({ method: 'GET' })
    );
  });

  it('agrega los parámetros y omite los vacíos', async () => {
    const fetchFalso = simularFetch(respuesta([]));

    await peticion('http://api', '/datos', {
      parametros: { estado: 'En Proceso', q: '', otro: undefined, nulo: null, n: 0 },
    });

    expect(fetchFalso.calls.mostRecent().args[0]).toBe(
      'http://api/datos?estado=En+Proceso&n=0'
    );
  });

  it('envía el cuerpo como JSON', async () => {
    const fetchFalso = simularFetch(respuesta({ ok: true }));

    await peticion('http://api', '/datos', {
      metodo: 'POST',
      cuerpo: { nombre: 'Ana' },
    });

    const opciones = fetchFalso.calls.mostRecent().args[1];

    expect(opciones.method).toBe('POST');
    expect(opciones.body).toBe('{"nombre":"Ana"}');
    expect(opciones.headers['Content-Type']).toBe('application/json');
  });

  it('no envía el token en las llamadas públicas', async () => {
    guardarSesion({ token: 'secreto', usuario: { id: 1 } });
    const fetchFalso = simularFetch(respuesta([]));

    await peticion('http://api', '/datos');

    expect(fetchFalso.calls.mostRecent().args[1].headers.Authorization).toBeUndefined();
  });

  it('envía el token JWT en las llamadas autenticadas', async () => {
    guardarSesion({ token: 'secreto', usuario: { id: 1 } });
    const fetchFalso = simularFetch(respuesta([]));

    await peticion('http://api', '/datos', { autenticada: true });

    expect(fetchFalso.calls.mostRecent().args[1].headers.Authorization).toBe(
      'Bearer secreto'
    );
  });

  it('acepta respuestas sin cuerpo (como un 204)', async () => {
    simularFetch(respuesta(undefined, { status: 204 }));

    expect(await peticion('http://api', '/datos', { metodo: 'DELETE' })).toBeNull();
  });

  it('convierte un error del servidor en ErrorApi con mensaje, estado y errores', async () => {
    simularFetch(
      respuesta(
        { mensaje: 'Hay datos que no son válidos', errores: { nombre: 'Obligatorio' } },
        { ok: false, status: 400 }
      )
    );

    try {
      await peticion('http://api', '/datos');
      fail('debía lanzar un error');
    } catch (error) {
      expect(error instanceof ErrorApi).toBeTrue();
      expect(error.message).toBe('Hay datos que no son válidos');
      expect(error.estado).toBe(400);
      expect(error.errores).toEqual({ nombre: 'Obligatorio' });
    }
  });

  it('usa un mensaje genérico si el error no trae cuerpo', async () => {
    simularFetch(respuesta(undefined, { ok: false, status: 500 }));

    await expectAsync(peticion('http://api', '/datos')).toBeRejectedWithError(
      /error 500/
    );
  });

  it('avisa si no se puede conectar con el servidor', async () => {
    globalThis.fetch = jasmine
      .createSpy('fetch')
      .and.returnValue(Promise.reject(new TypeError('Failed to fetch')));

    await expectAsync(peticion('http://api', '/datos')).toBeRejectedWithError(
      /No se pudo conectar con el servidor/
    );
  });

  it('un 401 en una llamada autenticada cierra la sesión y avisa', async () => {
    guardarSesion({ token: 'vencido', usuario: { id: 1 } });
    simularFetch(respuesta({ mensaje: 'Token inválido o expirado' }, { ok: false, status: 401 }));
    const aviso = jasmine.createSpy('aviso');

    window.addEventListener(EVENTO_SESION_EXPIRADA, aviso);

    await expectAsync(
      peticion('http://api', '/datos', { autenticada: true })
    ).toBeRejectedWithError('Token inválido o expirado');

    window.removeEventListener(EVENTO_SESION_EXPIRADA, aviso);

    expect(aviso).toHaveBeenCalledTimes(1);
    expect(leerSesion()).toBeNull();
  });

  it('un 401 en el login (llamada pública) no toca la sesión', async () => {
    guardarSesion({ token: 'vigente', usuario: { id: 1 } });
    simularFetch(respuesta({ mensaje: 'Correo o contraseña incorrectos' }, { ok: false, status: 401 }));

    await expectAsync(peticion('http://api', '/login')).toBeRejectedWithError(
      'Correo o contraseña incorrectos'
    );

    expect(obtenerToken()).toBe('vigente');
  });
});

describe('Llamadas a los microservicios', () => {
  let fetchOriginal;
  let fetchFalso;

  beforeEach(() => {
    fetchOriginal = globalThis.fetch;
    fetchFalso = jasmine.createSpy('fetch').and.callFake(() => respuesta({}));
    globalThis.fetch = fetchFalso;
    guardarSesion({ token: 'tok', usuario: { id: 1 } });
  });

  afterEach(() => {
    globalThis.fetch = fetchOriginal;
  });

  const ultima = () => fetchFalso.calls.mostRecent().args;

  it('authApi.iniciarSesion hace POST a /api/auth/login', async () => {
    await authApi.iniciarSesion('a@b.cl', 'clave1');

    expect(ultima()[0]).toBe(`${URL_AUTH}/api/auth/login`);
    expect(ultima()[1].method).toBe('POST');
    expect(JSON.parse(ultima()[1].body)).toEqual({ correo: 'a@b.cl', password: 'clave1' });
  });

  it('authApi.registrar hace POST a /api/auth/registro', async () => {
    await authApi.registrar({ nombre: 'Ana' });

    expect(ultima()[0]).toBe(`${URL_AUTH}/api/auth/registro`);
    expect(ultima()[1].method).toBe('POST');
  });

  it('ubicacionesApi pide regiones y comunas a auth-service', async () => {
    await ubicacionesApi.regiones();
    expect(ultima()[0]).toBe(`${URL_AUTH}/api/regiones`);

    await ubicacionesApi.comunas();
    expect(ultima()[0]).toBe(`${URL_AUTH}/api/comunas`);
  });

  it('catalogoApi.listar usa el catálogo público, sin token', async () => {
    await catalogoApi.listar();

    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/productos`);
    expect(ultima()[1].headers.Authorization).toBeUndefined();
  });

  it('productosApi usa las rutas del panel con el token', async () => {
    await productosApi.listar();
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/productos?todos=false`);
    expect(ultima()[1].headers.Authorization).toBe('Bearer tok');

    await productosApi.listar({ todos: true });
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/productos?todos=true`);

    await productosApi.crear({ codigo: 'AB1' });
    expect(ultima()[1].method).toBe('POST');

    await productosApi.actualizar('AB 1/x', { nombre: 'N' });
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/productos/AB%201%2Fx`);
    expect(ultima()[1].method).toBe('PUT');

    await productosApi.eliminar('AB1');
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/productos/AB1`);
    expect(ultima()[1].method).toBe('DELETE');
  });

  it('encargosApi lista, obtiene y cambia el estado', async () => {
    await encargosApi.listar();
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/encargos`);

    await encargosApi.listar('En Proceso');
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/encargos?estado=En+Proceso`);

    await encargosApi.obtener(7);
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/encargos/7`);

    await encargosApi.cambiarEstado(7, 'Completado');
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/encargos/7/estado`);
    expect(ultima()[1].method).toBe('PATCH');
    expect(JSON.parse(ultima()[1].body)).toEqual({ estado: 'Completado' });
  });

  it('usuariosApi lista por grupo, crea, actualiza y elimina', async () => {
    await usuariosApi.listar('clientes');
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/usuarios?grupo=clientes`);

    await usuariosApi.listar();
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/usuarios`);

    await usuariosApi.crear({ nombre: 'Ana' });
    expect(ultima()[1].method).toBe('POST');

    await usuariosApi.actualizar(3, { nombre: 'Ana' });
    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/usuarios/3`);
    expect(ultima()[1].method).toBe('PUT');

    await usuariosApi.eliminar(3);
    expect(ultima()[1].method).toBe('DELETE');
  });

  it('dashboardApi.resumen pide el dashboard', async () => {
    await dashboardApi.resumen();

    expect(ultima()[0]).toBe(`${URL_ADMIN}/api/admin/dashboard`);
  });
});
