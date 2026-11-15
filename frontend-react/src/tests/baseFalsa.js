// "Backend falso" para las pruebas: reemplaza (con spyOn) las funciones de
// src/api por versiones que trabajan sobre arreglos en memoria. Así las
// pruebas no necesitan servidor ni base de datos, y cada prueba puede revisar
// lo que quedó guardado (el arreglo que devuelven los instalar...) y con qué
// datos se llamó a la API (api.crear.calls.mostRecent().args).
//
// Hay que llamarlas dentro de un beforeEach o de una prueba (usan spyOn).

import { dashboardApi, encargosApi, productosApi, usuariosApi } from '../api/adminApi.js';
import { ubicacionesApi } from '../api/authApi.js';
import { ErrorApi } from '../api/http.js';
import { REGIONES } from '../data/regiones.js';
import { ESTADOS_ENCARGO } from '../data/encargos.js';
import { limpiarCacheEncargos } from '../modules/admin/services/encargosService.js';
import { limpiarCacheUbicaciones } from '../modules/admin/services/personasService.js';

const copia = (valor) => JSON.parse(JSON.stringify(valor));

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

export function instalarProductosFalsos(iniciales = []) {
  const bd = copia(iniciales);
  const indiceDe = (codigo) => bd.findIndex((p) => p.codigo === codigo);

  spyOn(productosApi, 'listar').and.callFake(async () => copia(bd));

  spyOn(productosApi, 'crear').and.callFake(async (producto) => {
    const nuevo = { ...copia(producto), fechaIngreso: '2026-11-14', activo: true };

    bd.push(nuevo);

    return copia(nuevo);
  });

  spyOn(productosApi, 'actualizar').and.callFake(async (codigo, datos) => {
    const indice = indiceDe(codigo);

    if (indice === -1) {
      throw new ErrorApi('Producto no encontrado', 404);
    }

    // El código y la fecha de ingreso no cambian al editar
    bd[indice] = { ...bd[indice], ...copia(datos), codigo };

    return copia(bd[indice]);
  });

  spyOn(productosApi, 'eliminar').and.callFake(async (codigo) => {
    const indice = indiceDe(codigo);

    if (indice === -1) {
      throw new ErrorApi('Producto no encontrado', 404);
    }

    bd.splice(indice, 1);

    return { eliminado: true, mensaje: 'Producto eliminado con éxito.' };
  });

  return bd;
}

// ---------------------------------------------------------------------------
// Regiones, comunas y usuarios
// ---------------------------------------------------------------------------

// Mismas regiones y comunas que usa el formulario, con ids como los de la base.
export const UBICACIONES_FALSAS = (() => {
  const regiones = REGIONES.map((region, i) => ({ id: i + 1, nombre: region.nombre }));
  const comunas = [];

  REGIONES.forEach((region, i) => {
    region.comunas.forEach((nombre) => {
      comunas.push({ id: comunas.length + 1, idRegion: i + 1, nombre });
    });
  });

  return { regiones, comunas };
})();

export function instalarUbicacionesFalsas() {
  limpiarCacheUbicaciones();

  spyOn(ubicacionesApi, 'regiones').and.callFake(async () =>
    copia(UBICACIONES_FALSAS.regiones)
  );
  spyOn(ubicacionesApi, 'comunas').and.callFake(async () =>
    copia(UBICACIONES_FALSAS.comunas)
  );
}

function ubicacionDe(idComuna) {
  const comuna = UBICACIONES_FALSAS.comunas.find((c) => c.id === idComuna);
  const region = comuna
    ? UBICACIONES_FALSAS.regiones.find((r) => r.id === comuna.idRegion)
    : null;

  return {
    idRegion: region?.id ?? null,
    region: region?.nombre ?? null,
    idComuna: comuna?.id ?? null,
    comuna: comuna?.nombre ?? null,
  };
}

// Convierte un usuario con la forma antigua del frontend a la que entrega el backend.
export function aUsuarioDto(usuario, id) {
  const comuna = UBICACIONES_FALSAS.comunas.find((c) => {
    const region = UBICACIONES_FALSAS.regiones.find((r) => r.id === c.idRegion);

    return c.nombre === usuario.comuna && region?.nombre === usuario.region;
  });

  return {
    id,
    run: usuario.run ?? null,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos ?? null,
    correo: usuario.correo,
    tipo: usuario.tipoUsuario === 'Empleado' ? 'Vendedor' : usuario.tipoUsuario,
    ...ubicacionDe(comuna?.id),
    direccion: usuario.direccion ?? null,
    estado: usuario.estado ?? 'Activo',
    fechaRegistro: usuario.fechaRegistro ? `${usuario.fechaRegistro}T10:00:00` : null,
  };
}

function usuarioDesdeCuerpo(cuerpo, id) {
  return {
    id,
    run: cuerpo.run ?? null,
    nombre: cuerpo.nombre,
    apellidos: cuerpo.apellidos || null,
    correo: cuerpo.correo.toLowerCase(),
    tipo: cuerpo.tipo,
    ...ubicacionDe(cuerpo.idComuna),
    direccion: cuerpo.direccion || null,
    estado: cuerpo.estado || 'Activo',
    fechaRegistro: '2026-11-14T10:00:00',
  };
}

export function instalarUsuariosFalsos(usuarios = []) {
  instalarUbicacionesFalsas();

  const bd = usuarios.map((usuario, i) => aUsuarioDto(usuario, i + 1));
  let siguienteId = bd.length + 1;
  const indiceDe = (id) => bd.findIndex((u) => u.id === id);

  function revisarDuplicados(cuerpo, idExcluido) {
    const otros = bd.filter((u) => u.id !== idExcluido);

    if (otros.some((u) => u.correo.toLowerCase() === cuerpo.correo.toLowerCase())) {
      throw new ErrorApi('Ya existe un usuario con ese correo', 409);
    }

    if (cuerpo.run && otros.some((u) => u.run === cuerpo.run)) {
      throw new ErrorApi('Ya existe un usuario con ese RUN', 409);
    }
  }

  spyOn(usuariosApi, 'listar').and.callFake(async (grupo) =>
    copia(
      bd.filter((u) => {
        if (grupo === 'clientes') return u.tipo === 'Cliente';
        if (grupo === 'empleados') return u.tipo !== 'Cliente';

        return true;
      })
    )
  );

  spyOn(usuariosApi, 'crear').and.callFake(async (cuerpo) => {
    revisarDuplicados(cuerpo);

    const nuevo = usuarioDesdeCuerpo(cuerpo, siguienteId);

    siguienteId += 1;
    bd.push(nuevo);

    return copia(nuevo);
  });

  spyOn(usuariosApi, 'actualizar').and.callFake(async (id, cuerpo) => {
    const indice = indiceDe(id);

    if (indice === -1) {
      throw new ErrorApi('Usuario no encontrado', 404);
    }

    revisarDuplicados(cuerpo, id);
    // La fecha de registro y el id no cambian al editar
    bd[indice] = {
      ...usuarioDesdeCuerpo(cuerpo, id),
      fechaRegistro: bd[indice].fechaRegistro,
    };

    return copia(bd[indice]);
  });

  spyOn(usuariosApi, 'eliminar').and.callFake(async (id) => {
    const indice = indiceDe(id);

    if (indice === -1) {
      throw new ErrorApi('Usuario no encontrado', 404);
    }

    bd.splice(indice, 1);

    return null;
  });

  return bd;
}

// ---------------------------------------------------------------------------
// Encargos y dashboard
// ---------------------------------------------------------------------------

// Convierte un encargo con la forma antigua del frontend a la que entrega el backend.
export function aEncargoDto(encargo, id) {
  return {
    id,
    numeroOrden: encargo.id,
    cliente: encargo.cliente,
    correo: encargo.correo ?? null,
    fecha: `${encargo.fecha}T10:00:00`,
    estado: encargo.estado,
    tipoEntrega:
      encargo.tipoEntrega === 'retiro'
        ? 'Retiro en tienda'
        : encargo.tipoEntrega
          ? 'Entrega estándar'
          : null,
    costoEntrega: 0,
    direccionEnvio: null,
    comunaEnvio: null,
    total: encargo.total,
    items: [],
  };
}

// "encargos" va del más antiguo al más nuevo; el backend los entrega al revés.
export function instalarEncargosFalsos(encargos = []) {
  limpiarCacheEncargos();

  const bd = encargos.map((encargo, i) => aEncargoDto(encargo, i + 1));
  const buscar = (id) => {
    const encargo = bd.find((e) => e.id === id);

    if (!encargo) {
      throw new ErrorApi('Encargo no encontrado', 404);
    }

    return encargo;
  };

  spyOn(encargosApi, 'listar').and.callFake(async (estado) =>
    copia([...bd].reverse().filter((e) => !estado || e.estado === estado))
  );

  spyOn(encargosApi, 'obtener').and.callFake(async (id) => copia(buscar(id)));

  spyOn(encargosApi, 'cambiarEstado').and.callFake(async (id, estado) => {
    const encargo = buscar(id);

    encargo.estado = estado;

    return copia(encargo);
  });

  spyOn(dashboardApi, 'resumen').and.callFake(async () => ({
    totalEncargos: bd.length,
    encargosPorEstado: Object.fromEntries(
      ESTADOS_ENCARGO.map((estado) => [
        estado,
        bd.filter((e) => e.estado === estado).length,
      ])
    ),
  }));

  return bd;
}
