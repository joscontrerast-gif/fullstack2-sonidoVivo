// Validaciones puras de los formularios de clientes y empleados.
// Migradas desde js/validaciones.js: cada función devuelve el mensaje de
// error (string) o null si el valor es válido. No tocan el DOM.

import { normalizarRun } from '../../../data/usuarios.js';

export const DOMINIOS_PERMITIDOS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];

export const LIMITES_PERSONA = {
  nombre: 50,
  apellidos: 100,
  correo: 100,
  direccion: 300,
  contrasenaMin: 6,
  contrasenaMax: 20,
};

export function validarTexto(valor, nombreCampo, maximo) {
  const texto = String(valor ?? '').trim();

  if (texto === '') {
    return `${nombreCampo} es obligatorio.`;
  }

  if (maximo && texto.length > maximo) {
    return `${nombreCampo} no puede superar los ${maximo} caracteres.`;
  }

  return null;
}

export function validarSeleccion(valor, nombreCampo) {
  return String(valor ?? '').trim() === ''
    ? `Debes seleccionar ${nombreCampo}.`
    : null;
}

export function validarCorreo(valor) {
  const correo = String(valor ?? '').trim();

  if (correo === '') {
    return 'El correo es obligatorio.';
  }

  if (correo.length > LIMITES_PERSONA.correo) {
    return `El correo no puede superar los ${LIMITES_PERSONA.correo} caracteres.`;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return 'Ingresa un correo con formato válido.';
  }

  const dominio = correo.split('@')[1].toLowerCase();

  if (!DOMINIOS_PERMITIDOS.includes(dominio)) {
    return 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com';
  }

  return null;
}

// Dígito verificador del RUN chileno (módulo 11)
export function calcularDigitoVerificador(cuerpo) {
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);

  if (resto === 11) return '0';
  if (resto === 10) return 'K';

  return String(resto);
}

export function validarRun(valor) {
  const run = normalizarRun(valor);

  if (run === '') {
    return 'El RUN es obligatorio.';
  }

  if (run.length < 7 || run.length > 9) {
    return 'El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guion.';
  }

  const cuerpo = run.slice(0, -1);
  const digito = run.slice(-1);

  if (!/^\d+$/.test(cuerpo)) {
    return 'El RUN solo debe contener números y el dígito verificador.';
  }

  if (digito !== calcularDigitoVerificador(cuerpo)) {
    return 'El RUN ingresado no es válido.';
  }

  return null;
}

// Al editar, dejar la contraseña vacía significa "no cambiarla".
export function validarContrasena(valor, { obligatoria = true } = {}) {
  const contrasena = String(valor ?? '');

  if (contrasena === '') {
    return obligatoria ? 'La contraseña es obligatoria.' : null;
  }

  const { contrasenaMin, contrasenaMax } = LIMITES_PERSONA;

  if (contrasena.length < contrasenaMin || contrasena.length > contrasenaMax) {
    return `La contraseña debe tener entre ${contrasenaMin} y ${contrasenaMax} caracteres.`;
  }

  return null;
}

export function validarConfirmacion(
  contrasena,
  confirmacion,
  { obligatoria = true } = {}
) {
  const original = String(contrasena ?? '');
  const confirmar = String(confirmacion ?? '');

  if (!obligatoria && original === '' && confirmar === '') {
    return null;
  }

  if (confirmar === '') {
    return 'Debes confirmar la contraseña.';
  }

  if (original !== confirmar) {
    return 'Las contraseñas no coinciden.';
  }

  return null;
}
