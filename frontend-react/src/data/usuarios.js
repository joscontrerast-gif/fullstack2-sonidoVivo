// Capa de datos de usuarios (clientes y empleados).
// Usa la misma clave de localStorage que el sitio HTML original ("usuarios"),
// donde registro.html guarda a los clientes y el panel guarda a los empleados.
// NOTA: igual que en el sitio original, las contraseñas se guardan en texto
// plano porque es una simulación sin backend. No es apto para producción.

import { fechaHoy } from './productos.js';

export const CLAVE_USUARIOS = 'usuarios';

export function normalizarRun(run) {
  return String(run ?? '')
    .trim()
    .toUpperCase()
    .replace(/\./g, '')
    .replace(/-/g, '');
}

function normalizarCorreo(correo) {
  return String(correo ?? '').trim().toLowerCase();
}

// Identificador de un usuario: su RUN, o su correo si es un usuario antiguo
// (por ejemplo los de demostración) que no tiene RUN.
export function claveDe(usuario) {
  return normalizarRun(usuario?.run) || normalizarCorreo(usuario?.correo);
}

export function normalizarClave(clave) {
  const limpia = String(clave ?? '').trim();

  return limpia.includes('@') ? normalizarCorreo(limpia) : normalizarRun(limpia);
}

export function obtenerUsuarios() {
  try {
    const datos = localStorage.getItem(CLAVE_USUARIOS);
    const usuarios = datos ? JSON.parse(datos) : [];

    return Array.isArray(usuarios) ? usuarios : [];
  } catch {
    return [];
  }
}

export function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

function buscarIndice(usuarios, clave) {
  const objetivo = normalizarClave(clave);

  return usuarios.findIndex((usuario) => claveDe(usuario) === objetivo);
}

// READ
export function obtenerUsuarioPorClave(clave) {
  const usuarios = obtenerUsuarios();
  const indice = buscarIndice(usuarios, clave);

  return indice === -1 ? null : usuarios[indice];
}

// CREATE
export function crearUsuario(usuario) {
  const usuarios = obtenerUsuarios();
  const run = normalizarRun(usuario.run);
  const correo = normalizarCorreo(usuario.correo);

  const duplicado = usuarios.some(
    (existente) =>
      (run && normalizarRun(existente.run) === run) ||
      (correo && normalizarCorreo(existente.correo) === correo)
  );

  if (duplicado) {
    throw new Error('El RUN o Correo ya se encuentra registrado.');
  }

  const nuevo = {
    ...usuario,
    run,
    fechaRegistro: usuario.fechaRegistro || fechaHoy(),
    estado: usuario.estado || 'Activo',
  };

  guardarUsuarios([...usuarios, nuevo]);

  return nuevo;
}

// UPDATE: la fecha de registro no cambia, y si no se envía contraseña
// se conserva la anterior.
export function actualizarUsuario(clave, cambios) {
  const usuarios = obtenerUsuarios();
  const indice = buscarIndice(usuarios, clave);

  if (indice === -1) {
    throw new Error('No existe el usuario que intentas modificar.');
  }

  const permitidos = { ...cambios };
  delete permitidos.fechaRegistro;

  if (!permitidos.password) {
    delete permitidos.password;
  }

  if (permitidos.run) {
    permitidos.run = normalizarRun(permitidos.run);
  }

  const correoNuevo = normalizarCorreo(permitidos.correo);
  const correoOcupado =
    correoNuevo &&
    usuarios.some(
      (existente, posicion) =>
        posicion !== indice && normalizarCorreo(existente.correo) === correoNuevo
    );

  if (correoOcupado) {
    throw new Error('El RUN o Correo ya se encuentra registrado.');
  }

  const actualizado = { ...usuarios[indice], ...permitidos };
  const copia = [...usuarios];
  copia[indice] = actualizado;
  guardarUsuarios(copia);

  return actualizado;
}

// DELETE
export function eliminarUsuario(clave) {
  const usuarios = obtenerUsuarios();
  const indice = buscarIndice(usuarios, clave);

  if (indice === -1) {
    throw new Error('No existe el usuario que intentas eliminar.');
  }

  const eliminado = usuarios[indice];

  guardarUsuarios(usuarios.filter((_, posicion) => posicion !== indice));

  return eliminado;
}
