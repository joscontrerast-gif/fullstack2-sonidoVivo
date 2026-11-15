// Lógica de la administración de clientes y empleados.
// Ambos son usuarios de la base de datos y se distinguen por su rol
// (Cliente, Vendedor, Administrador). Los datos vienen del backend.

import { ubicacionesApi } from '../../../api/authApi.js';
import { usuariosApi } from '../../../api/adminApi.js';
import { ErrorApi } from '../../../api/http.js';
import {
  claveDe,
  normalizarClave,
  normalizarRun,
} from '../../../data/usuarios.js';
import {
  LIMITES_PERSONA,
  validarConfirmacion,
  validarContrasena,
  validarCorreo,
  validarRun,
  validarSeleccion,
  validarTexto,
} from './validaciones.js';

export const ROLES_EMPLEADO = ['Vendedor', 'Administrador'];

// Valores de tipoUsuario que se consideran "empleado"
const TIPOS_EMPLEADO = ['Empleado', 'Vendedor', 'Administrador'];

export const CONFIG_PERSONAS = {
  cliente: {
    singular: 'Cliente',
    plural: 'Clientes',
    nuevo: 'Nuevo cliente',
    editar: 'Editar cliente',
    registrado: 'Cliente registrado con éxito.',
    actualizado: 'Cliente actualizado con éxito.',
    eliminado: 'Cliente eliminado correctamente.',
    vacio: 'No hay clientes registrados en el sistema.',
  },
  empleado: {
    singular: 'Empleado',
    plural: 'Empleados',
    nuevo: 'Nuevo empleado',
    editar: 'Editar empleado',
    registrado: 'Empleado registrado con éxito.',
    actualizado: 'Empleado actualizado con éxito.',
    eliminado: 'Empleado eliminado correctamente.',
    vacio: 'No se encontraron empleados registrados.',
  },
};

const MENSAJE_DUPLICADO = 'El RUN o Correo ya se encuentra registrado.';

export function esDelTipo(usuario, tipo) {
  return tipo === 'cliente'
    ? usuario.tipoUsuario === 'Cliente'
    : TIPOS_EMPLEADO.includes(usuario.tipoUsuario);
}

// Convierte un usuario del backend a la forma que usan los componentes.
export function aPersona(dto) {
  return {
    id: dto.id,
    run: dto.run ?? '',
    nombre: dto.nombre,
    apellidos: dto.apellidos ?? '',
    correo: dto.correo,
    tipoUsuario: dto.tipo,
    rol: dto.tipo,
    region: dto.region ?? '',
    comuna: dto.comuna ?? '',
    direccion: dto.direccion ?? '',
    estado: dto.estado,
    fechaRegistro: dto.fechaRegistro ? String(dto.fechaRegistro).slice(0, 10) : '',
  };
}

export async function listarPersonas(tipo) {
  const lista = await usuariosApi.listar(
    tipo === 'cliente' ? 'clientes' : 'empleados'
  );

  return lista.map(aPersona);
}

// El formulario trabaja con nombres de región y comuna; el backend, con ids.
let cacheUbicaciones = null;

export function limpiarCacheUbicaciones() {
  cacheUbicaciones = null;
}

async function resolverComuna(nombreRegion, nombreComuna) {
  if (!cacheUbicaciones) {
    const [regiones, comunas] = await Promise.all([
      ubicacionesApi.regiones(),
      ubicacionesApi.comunas(),
    ]);

    cacheUbicaciones = { regiones, comunas };
  }

  const igual = (a, b) =>
    String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  const region = cacheUbicaciones.regiones.find((r) =>
    igual(r.nombre, nombreRegion)
  );
  const comuna = cacheUbicaciones.comunas.find(
    (c) => c.idRegion === region?.id && igual(c.nombre, nombreComuna)
  );

  if (!comuna) {
    throw new Error('La región o comuna seleccionada no existe en la base de datos.');
  }

  return comuna.id;
}

// Filtro de la lista de empleados: 'todos' | 'Administrador' | 'Empleado'
// ("Empleado" agrupa a Empleados y Vendedores, como en el sitio original).
export function filtrarEmpleados(empleados, filtro = 'todos') {
  if (filtro === 'Administrador') {
    return empleados.filter((e) => e.tipoUsuario === 'Administrador');
  }

  if (filtro === 'Empleado') {
    return empleados.filter(
      (e) => e.tipoUsuario === 'Empleado' || e.tipoUsuario === 'Vendedor'
    );
  }

  return empleados;
}

export function nombreCompleto(usuario) {
  return [usuario.nombre, usuario.apellidos].filter(Boolean).join(' ');
}

export function estadoDe(usuario) {
  return usuario.estado || 'Activo';
}

export function rolDe(usuario) {
  return usuario.rol || usuario.tipoUsuario || '';
}

function esCorreoDeOtro(existentes, correo, claveOriginal) {
  const objetivo = correo.toLowerCase();
  // La clave original puede ser un RUN o, en usuarios sin RUN, su correo.
  const propia = claveOriginal ? normalizarClave(claveOriginal) : '';

  return existentes.some(
    (existente) =>
      String(existente.correo ?? '').trim().toLowerCase() === objetivo &&
      claveDe(existente) !== propia
  );
}

/**
 * Valida el formulario de un cliente o empleado.
 * Devuelve { valido, errores, persona }. Al editar no se valida ni se
 * cambia el RUN, y la contraseña vacía significa "conservar la actual".
 */
export function validarPersona(
  datos = {},
  { tipo = 'cliente', modo = 'crear', existentes = [], claveOriginal = null } = {}
) {
  const edicion = modo === 'editar';
  const errores = {};

  const run = normalizarRun(datos.run);
  const nombre = String(datos.nombre ?? '').trim();
  const apellidos = String(datos.apellidos ?? '').trim();
  const correo = String(datos.correo ?? '').trim();
  const rol = String(datos.rol ?? '').trim();
  const region = String(datos.region ?? '').trim();
  const comuna = String(datos.comuna ?? '').trim();
  const direccion = String(datos.direccion ?? '').trim();
  const contrasena = String(datos.contrasena ?? '');

  const asignar = (campo, mensaje) => {
    if (mensaje) {
      errores[campo] = mensaje;
    }
  };

  if (!edicion) {
    asignar('run', validarRun(run));
  }

  asignar('nombre', validarTexto(nombre, 'El nombre', LIMITES_PERSONA.nombre));
  asignar(
    'apellidos',
    validarTexto(apellidos, 'Los apellidos', LIMITES_PERSONA.apellidos)
  );
  asignar('correo', validarCorreo(correo));

  if (tipo === 'empleado') {
    asignar('rol', validarSeleccion(rol, 'un rol o cargo'));

    if (!errores.rol && !ROLES_EMPLEADO.includes(rol)) {
      errores.rol = 'El rol seleccionado no es válido.';
    }
  }

  asignar('region', validarSeleccion(region, 'una región'));
  asignar('comuna', validarSeleccion(comuna, 'una comuna'));
  asignar(
    'direccion',
    validarTexto(direccion, 'La dirección', LIMITES_PERSONA.direccion)
  );
  asignar('contrasena', validarContrasena(contrasena, { obligatoria: !edicion }));
  asignar(
    'confirmarContrasena',
    validarConfirmacion(contrasena, datos.confirmarContrasena, {
      obligatoria: !edicion,
    })
  );

  // Duplicados: solo se revisan si el RUN y el correo ya son válidos
  if (!edicion && !errores.run && !errores.correo) {
    const duplicado = existentes.some(
      (existente) =>
        normalizarRun(existente.run) === run ||
        String(existente.correo ?? '').trim().toLowerCase() ===
          correo.toLowerCase()
    );

    if (duplicado) {
      errores.run = MENSAJE_DUPLICADO;
      errores.correo = MENSAJE_DUPLICADO;
    }
  }

  if (edicion && !errores.correo && esCorreoDeOtro(existentes, correo, claveOriginal)) {
    errores.correo = MENSAJE_DUPLICADO;
  }

  const valido = Object.keys(errores).length === 0;

  if (!valido) {
    return { valido, errores, persona: null };
  }

  const persona = {
    nombre,
    apellidos,
    correo,
    tipoUsuario: tipo === 'cliente' ? 'Cliente' : rol,
    region,
    comuna,
    direccion,
  };

  if (!edicion) {
    persona.run = run;
  }

  if (tipo === 'empleado') {
    persona.rol = rol;
  }

  if (contrasena !== '') {
    persona.password = contrasena;
  }

  return { valido, errores: {}, persona };
}

// Errores del servidor → errores por campo del formulario.
function resultadoDeError(error) {
  if (error instanceof ErrorApi) {
    if (Object.keys(error.errores).length > 0) {
      return { ok: false, errores: error.errores, persona: null };
    }

    if (error.estado === 409) {
      const campo = /correo/i.test(error.message) ? 'correo' : 'run';

      return { ok: false, errores: { [campo]: error.message }, persona: null };
    }
  }

  throw error;
}

/**
 * Crea (claveOriginal = null) o edita una persona.
 * Si los datos no son válidos NO se llama al servidor y se devuelven los errores.
 */
export async function guardarPersona(datos, tipo, claveOriginal = null) {
  const modo = claveOriginal ? 'editar' : 'crear';
  const existentes = (await usuariosApi.listar()).map(aPersona);
  const resultado = validarPersona(datos, {
    tipo,
    modo,
    existentes,
    claveOriginal,
  });

  if (!resultado.valido) {
    return { ok: false, errores: resultado.errores, persona: null };
  }

  const persona = resultado.persona;
  let original = null;

  if (modo === 'editar') {
    const clave = normalizarClave(claveOriginal);

    original = existentes.find((existente) => claveDe(existente) === clave);

    if (!original) {
      throw new Error('El usuario ya no existe.');
    }
  }

  const cuerpo = {
    run: original ? original.run || undefined : persona.run,
    nombre: persona.nombre,
    apellidos: persona.apellidos,
    correo: persona.correo,
    password: persona.password,
    tipo: persona.tipoUsuario,
    idComuna: await resolverComuna(persona.region, persona.comuna),
    direccion: persona.direccion,
    estado: original ? original.estado : 'Activo',
  };

  try {
    const guardada =
      modo === 'editar'
        ? await usuariosApi.actualizar(original.id, cuerpo)
        : await usuariosApi.crear(cuerpo);

    return { ok: true, errores: {}, persona: aPersona(guardada) };
  } catch (error) {
    return resultadoDeError(error);
  }
}

// Elimina a la persona (objeto con su id, como lo entrega listarPersonas).
export function borrarPersona(persona) {
  return usuariosApi.eliminar(persona.id);
}
