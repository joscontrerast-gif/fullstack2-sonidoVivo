// Lógica de la administración de clientes y empleados.
// Ambos viven en la misma lista de localStorage ("usuarios") y se
// distinguen por el campo tipoUsuario, igual que en el sitio original.

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

export function listarPersonas(tipo) {
  return obtenerUsuarios().filter((usuario) => esDelTipo(usuario, tipo));
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

/**
 * Crea (claveOriginal = null) o edita una persona.
 * Si los datos no son válidos NO se guarda nada y se devuelven los errores.
 */
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
