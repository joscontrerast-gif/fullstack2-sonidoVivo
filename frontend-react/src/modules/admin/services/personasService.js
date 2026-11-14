import { URLS, apiFetch, obtenerToken } from '../../../services/api.js';
import {
  actualizarUsuario,
  claveDe,
  crearUsuario,
  eliminarUsuario,
  normalizarClave,
  normalizarRun,
  obtenerUsuarios,
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
  const t = usuario.tipoUsuario || usuario.tipo;
  return tipo === 'cliente' ? t === 'Cliente' : TIPOS_EMPLEADO.includes(t);
}

export function listarPersonas(tipo) {
  return obtenerUsuarios().filter((usuario) => esDelTipo(usuario, tipo));
}

export function filtrarEmpleados(empleados, filtro = 'todos') {
  if (filtro === 'Administrador') {
    return empleados.filter((e) => (e.tipoUsuario || e.tipo) === 'Administrador');
  }

  if (filtro === 'Empleado') {
    return empleados.filter((e) => {
      const t = e.tipoUsuario || e.tipo;
      return t === 'Empleado' || t === 'Vendedor';
    });
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
  return usuario.rol || usuario.tipoUsuario || usuario.tipo || '';
}

function esCorreoDeOtro(existentes, correo, claveOriginal) {
  const objetivo = correo.toLowerCase();
  const propia = claveOriginal ? normalizarClave(claveOriginal) : '';

  return existentes.some(
    (existente) =>
      String(existente.correo ?? '').trim().toLowerCase() === objetivo &&
      claveDe(existente) !== propia
  );
}

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
    if (mensaje) errores[campo] = mensaje;
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

  return { valido: true, errores: {}, persona };
}

export function guardarPersona(datos, tipo, claveOriginal = null) {
  const modo = claveOriginal ? 'editar' : 'crear';
  const resultado = validarPersona(datos, {
    tipo,
    modo,
    existentes: obtenerUsuarios(),
    claveOriginal,
  });

  if (!resultado.valido) {
    return { ok: false, errores: resultado.errores, persona: null };
  }

  const persona =
    modo === 'editar'
      ? actualizarUsuario(claveOriginal, resultado.persona)
      : crearUsuario(resultado.persona);

  return { ok: true, errores: {}, persona };
}

export function borrarPersona(clave) {
  return eliminarUsuario(clave);
}

// --- Funciones conectadas al microservicio admin (8082) ---

function normalizarUsuarioBackend(u) {
  return {
    ...u,
    tipoUsuario: u.tipo,
    rol: u.tipo,
    fechaRegistro: u.fechaRegistro
      ? new Date(u.fechaRegistro).toLocaleDateString('es-CL')
      : '—',
  };
}

export async function listarPersonasApi(tipo) {
  if (!obtenerToken()) {
    return listarPersonas(tipo);
  }
  const grupo = tipo === 'cliente' ? 'clientes' : 'empleados';
  const lista = await apiFetch(
    URLS.admin,
    `/api/admin/usuarios?grupo=${encodeURIComponent(grupo)}`
  );
  return (Array.isArray(lista) ? lista : []).map(normalizarUsuarioBackend);
}

export async function guardarPersonaApi(datos, tipo, personaOriginal = null) {
  if (!obtenerToken()) {
    const claveOriginal = personaOriginal ? claveDe(personaOriginal) : null;
    return guardarPersona(datos, tipo, claveOriginal);
  }

  const modo = personaOriginal ? 'editar' : 'crear';
  const resultado = validarPersona(datos, { tipo, modo });
  if (!resultado.valido) {
    return { ok: false, errores: resultado.errores, persona: null };
  }

  const payload = {
    run: modo === 'editar' ? personaOriginal.run || null : normalizarRun(datos.run),
    nombre: resultado.persona.nombre,
    apellidos: resultado.persona.apellidos,
    correo: resultado.persona.correo,
    tipo: tipo === 'cliente' ? 'Cliente' : resultado.persona.rol,
    idComuna: datos.idComuna ? Number(datos.idComuna) : null,
    direccion: resultado.persona.direccion,
    estado: personaOriginal?.estado || 'Activo',
    ...(resultado.persona.password ? { password: resultado.persona.password } : {}),
  };

  const guardada =
    modo === 'editar'
      ? await apiFetch(
          URLS.admin,
          `/api/admin/usuarios/${encodeURIComponent(personaOriginal.id)}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
        )
      : await apiFetch(URLS.admin, '/api/admin/usuarios', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

  return { ok: true, errores: {}, persona: normalizarUsuarioBackend(guardada) };
}

export async function borrarPersonaApi(persona) {
  if (!obtenerToken()) {
    return borrarPersona(claveDe(persona));
  }
  const payload = {
    run: persona.run || null,
    nombre: persona.nombre,
    apellidos: persona.apellidos || '',
    correo: persona.correo,
    tipo: persona.tipo || persona.tipoUsuario,
    idComuna: persona.idComuna || null,
    direccion: persona.direccion || '',
    estado: 'Inactivo',
  };
  return await apiFetch(
    URLS.admin,
    `/api/admin/usuarios/${encodeURIComponent(persona.id)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
}