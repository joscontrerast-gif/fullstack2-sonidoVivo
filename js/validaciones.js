//InSesion
const DOMINIOS_PERMITIDOS = ["duoc.cl", "profesor.duoc.cl", "gmail.com"];

function mostrarError(inputId, mensaje) {
  const input = document.getElementById(inputId);
  const spanError = document.getElementById(`error-${inputId}`);
  if (input) input.classList.add("input-invalido");
  if (spanError) spanError.textContent = mensaje;
}

function limpiarError(inputId) {
  const input = document.getElementById(inputId);
  const spanError = document.getElementById(`error-${inputId}`);
  if (input) input.classList.remove("input-invalido");
  if (spanError) spanError.textContent = "";
}

function validarCorreo(inputId, requerido = true) {
  const valor = document.getElementById(inputId).value.trim();

  if (valor === "") {
    if (requerido) {
      mostrarError(inputId, "El correo es obligatorio.");
      return false;
    }
    limpiarError(inputId);
    return true;
  }

  if (valor.length > 100) {
    mostrarError(inputId, "El correo no puede superar los 100 caracteres.");
    return false;
  }

  const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  if (!formatoValido) {
    mostrarError(inputId, "Ingresa un correo con formato válido.");
    return false;
  }

  const dominio = valor.split("@")[1].toLowerCase();
  if (!DOMINIOS_PERMITIDOS.includes(dominio)) {
    mostrarError(
      inputId,
      "Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com",
    );
    return false;
  }

  limpiarError(inputId);
  return true;
}

function validarContrasena(inputId, min = 4, max = 10) {
  const valor = document.getElementById(inputId).value;

  if (valor === "") {
    mostrarError(inputId, "La contraseña es obligatoria.");
    return false;
  }
  if (valor.length < min || valor.length > max) {
    mostrarError(
      inputId,
      `La contraseña debe tener entre ${min} y ${max} caracteres.`,
    );
    return false;
  }
  limpiarError(inputId);
  return true;
}

function inicializarValidacionLogin() {
  const form = document.getElementById("formInicioSecion");
  if (!form) return;

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const correoValido = validarCorreo("correo");
    const contrasenaValida = validarContrasena("contrasena", 4, 10);

    if (correoValido && contrasenaValida) {
      alert("Inicio de sesión exitoso.");
      form.reset();
    }
  });

  document
    .getElementById("correo")
    .addEventListener("blur", () => validarCorreo("correo"));
  document
    .getElementById("contrasena")
    .addEventListener("blur", () => validarContrasena("contrasena", 4, 10));
}

document.addEventListener("DOMContentLoaded", function () {
  inicializarValidacionLogin();
});
