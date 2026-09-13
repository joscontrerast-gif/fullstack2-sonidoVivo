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

//Registro
function validarNoVacio(inputId, nombreCampo, maxLength) {
  const valor = document.getElementById(inputId).value.trim();
  if (valor === "") {
    mostrarError(inputId, `${nombreCampo} es obligatorio.`);
    return false;
  }
  if (maxLength && valor.length > maxLength) {
    mostrarError(
      inputId,
      `${nombreCampo} no puede superar los ${maxLength} caracteres.`,
    );
    return false;
  }
  limpiarError(inputId);
  return true;
}

function validarConfirmarContrasena(inputIdOriginal, inputIdConfirmar) {
  const original = document.getElementById(inputIdOriginal).value;
  const confirmar = document.getElementById(inputIdConfirmar).value;

  if (confirmar === "") {
    mostrarError(inputIdConfirmar, "Debes confirmar la contraseña.");
    return false;
  }
  if (original !== confirmar) {
    mostrarError(inputIdConfirmar, "Las contraseñas no coinciden.");
    return false;
  }
  limpiarError(inputIdConfirmar);
  return true;
}

function validarRun(inputId) {
  let valor = document.getElementById(inputId).value.trim().toUpperCase();
  valor = valor.replace(/\./g, "").replace(/-/g, "");

  if (valor === "") {
    mostrarError(inputId, "El RUN es obligatorio.");
    return false;
  }
  if (valor.length < 7 || valor.length > 9) {
    mostrarError(
      inputId,
      "El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guion.",
    );
    return false;
  }

  const cuerpo = valor.slice(0, -1);
  const dv = valor.slice(-1);

  if (!/^\d+$/.test(cuerpo)) {
    mostrarError(
      inputId,
      "El RUN solo debe contener números y el dígito verificador.",
    );
    return false;
  }

  // Cálculo del dígito verificador (módulo 11)
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  let dvEsperado;
  if (resto === 11) dvEsperado = "0";
  else if (resto === 10) dvEsperado = "K";
  else dvEsperado = String(resto);

  if (dv !== dvEsperado) {
    mostrarError(inputId, "El RUN ingresado no es válido.");
    return false;
  }

  limpiarError(inputId);
  return true;
}

function validarSelect(inputId, nombreCampo) {
  const valor = document.getElementById(inputId).value;
  if (valor === "" || valor === null) {
    mostrarError(inputId, `Debes seleccionar ${nombreCampo}.`);
    return false;
  }
  limpiarError(inputId);
  return true;
}

function inicializarValidacionRegistro() {
  const form = document.getElementById("formRegistro");
  if (!form) return;

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const runValido = validarRun("run");
    const nombreValido = validarNoVacio("nombre", "El nombre", 50);
    const apellidosValidos = validarNoVacio("apellidos", "Los apellidos", 100);
    const correoValido = validarCorreo("correo");
    const regionValida = validarSelect("region", "una región");
    const comunaValida = validarSelect("comuna", "una comuna");
    const direccionValida = validarNoVacio("direccion", "La dirección", 300);
    const contrasenaValida = validarContrasena("contrasena", 6, 20);
    const confirmarValida = validarConfirmarContrasena(
      "contrasena",
      "confirmarContrasena",
    );

    const formularioValido =
      runValido &&
      nombreValido &&
      apellidosValidos &&
      correoValido &&
      regionValida &&
      comunaValida &&
      direccionValida &&
      contrasenaValida &&
      confirmarValida;

    if (formularioValido) {
      alert("Registro exitoso.");
      form.reset();
    }
  });

  document
    .getElementById("run")
    .addEventListener("blur", () => validarRun("run"));
  document
    .getElementById("nombre")
    .addEventListener("blur", () => validarNoVacio("nombre", "El nombre", 50));
  document
    .getElementById("apellidos")
    .addEventListener("blur", () =>
      validarNoVacio("apellidos", "Los apellidos", 100),
    );
  document
    .getElementById("correo")
    .addEventListener("blur", () => validarCorreo("correo"));
  document
    .getElementById("region")
    .addEventListener("change", () => validarSelect("region", "una región"));
  document
    .getElementById("comuna")
    .addEventListener("change", () => validarSelect("comuna", "una comuna"));
  document
    .getElementById("direccion")
    .addEventListener("blur", () =>
      validarNoVacio("direccion", "La dirección", 300),
    );
  document
    .getElementById("contrasena")
    .addEventListener("blur", () => validarContrasena("contrasena", 6, 20));
  document
    .getElementById("confirmarContrasena")
    .addEventListener("blur", () =>
      validarConfirmarContrasena("contrasena", "confirmarContrasena"),
    );
}

//Contacto
function inicializarValidacionContacto() {
  const form = document.getElementById("formContacto");
  if (!form) return;

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombreValido = validarNoVacio("nombre", "El nombre", 100);
    const correoValido = validarCorreo("correo", true);
    const comentarioValido = validarNoVacio("comentario", "El comentario", 500);

    if (nombreValido && correoValido && comentarioValido) {
      alert("Tu mensaje fue enviado. Te responderemos a la brevedad.");
      form.reset();
    }
  });

  document
    .getElementById("nombre")
    .addEventListener("blur", () => validarNoVacio("nombre", "El nombre", 100));
  document
    .getElementById("correo")
    .addEventListener("blur", () => validarCorreo("correo", true));
  document
    .getElementById("comentario")
    .addEventListener("blur", () =>
      validarNoVacio("comentario", "El comentario", 500),
    );
}

document.addEventListener("DOMContentLoaded", function () {
  inicializarValidacionLogin();
  inicializarValidacionRegistro();
  inicializarValidacionContacto();
});
