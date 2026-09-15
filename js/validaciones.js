// ==================== CONFIGURACIÓN Y ERRORES ====================
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

// ==================== FUNCIONES DE VALIDACIÓN ====================
function validarCorreo(inputId, requerido = true) {
  const input = document.getElementById(inputId);
  if (!input) return true;
  const valor = input.value.trim();

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
  const input = document.getElementById(inputId);
  if (!input) return false;
  const valor = input.value;

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

function validarNoVacio(inputId, nombreCampo, maxLength) {
  const input = document.getElementById(inputId);
  if (!input) return false;
  const valor = input.value.trim();

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
  const inputOrig = document.getElementById(inputIdOriginal);
  const inputConf = document.getElementById(inputIdConfirmar);
  if (!inputOrig || !inputConf) return false;

  const original = inputOrig.value;
  const confirmar = inputConf.value;

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
  const input = document.getElementById(inputId);
  if (!input) return false;

  let valor = input.value.trim().toUpperCase();
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
  const input = document.getElementById(inputId);
  if (!input) return false;
  const valor = input.value;

  if (valor === "" || valor === null) {
    mostrarError(inputId, `Debes seleccionar ${nombreCampo}.`);
    return false;
  }
  limpiarError(inputId);
  return true;
}

// ==================== INICIALIZADORES Y LOCALSTORAGE ====================

// 1. INICIO DE SESIÓN
function inicializarValidacionLogin() {
  const form = document.getElementById("formInicioSecion");
  if (!form) return;

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const correoValido = validarCorreo("correo");
    const contrasenaValida = validarContrasena("contrasena", 4, 10);

    if (correoValido && contrasenaValida) {
      const correoValue = document.getElementById("correo").value.trim().toLowerCase();
      const contrasenaValue = document.getElementById("contrasena").value;

      // Consulta de credenciales en localStorage
      const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];
      const usuarioEncontrado = usuariosGuardados.find(
        (u) => u.correo.toLowerCase() === correoValue && u.password === contrasenaValue
      );

      if (usuarioEncontrado) {
        localStorage.setItem("usuarioActivo", JSON.stringify(usuarioEncontrado));
        alert(`¡Bienvenido/a, ${usuarioEncontrado.nombre}!`);
        window.location.href = "index.html";
      } else {
        mostrarError("correo", "Correo o contraseña incorrectos.");
        mostrarError("contrasena", "");
      }
    }
  });

  const correoInput = document.getElementById("correo");
  const passInput = document.getElementById("contrasena");
  if (correoInput) correoInput.addEventListener("blur", () => validarCorreo("correo"));
  if (passInput) passInput.addEventListener("blur", () => validarContrasena("contrasena", 4, 10));
}

// 2. REGISTRO DE USUARIOS
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
    const confirmarValida = validarConfirmarContrasena("contrasena", "confirmarContrasena");

    const tipoUsuarioInput = document.getElementById("tipoUsuario");
    const tipoUsuarioValido = tipoUsuarioInput ? validarSelect("tipoUsuario", "un tipo de usuario") : true;

    const formularioValido =
      runValido &&
      nombreValido &&
      apellidosValidos &&
      correoValido &&
      regionValida &&
      comunaValida &&
      direccionValida &&
      contrasenaValida &&
      confirmarValida &&
      tipoUsuarioValido;

    if (formularioValido) {
      const runClean = document.getElementById("run").value.trim().toUpperCase().replace(/\./g, "").replace(/-/g, "");
      const correoValue = document.getElementById("correo").value.trim();

      const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];

      // Control de existencia previa por RUN o Correo
      const existeDuplicado = usuariosGuardados.some(
        (u) => u.run === runClean || u.correo.toLowerCase() === correoValue.toLowerCase()
      );

      if (existeDuplicado) {
        mostrarError("run", "El RUN o Correo ya se encuentra registrado.");
        mostrarError("correo", "El RUN o Correo ya se encuentra registrado.");
        return;
      }

      // Estructura del nuevo registro
      const nuevoUsuario = {
        run: runClean,
        nombre: document.getElementById("nombre").value.trim(),
        apellidos: document.getElementById("apellidos").value.trim(),
        correo: correoValue,
        tipoUsuario: tipoUsuarioInput ? tipoUsuarioInput.value : "Cliente",
        region: document.getElementById("region").value,
        comuna: document.getElementById("comuna").value,
        direccion: document.getElementById("direccion").value.trim(),
        password: document.getElementById("contrasena").value,
        fechaRegistro: new Date().toISOString().split("T")[0],
        estado: "Activo"
      };

      usuariosGuardados.push(nuevoUsuario);
      localStorage.setItem("usuarios", JSON.stringify(usuariosGuardados));

      alert("Registro exitoso.");
      form.reset();
    }
  });

  // Listeners de eventos blur y change
  const inputs = [
    { id: "run", fn: () => validarRun("run") },
    { id: "nombre", fn: () => validarNoVacio("nombre", "El nombre", 50) },
    { id: "apellidos", fn: () => validarNoVacio("apellidos", "Los apellidos", 100) },
    { id: "correo", fn: () => validarCorreo("correo") },
    { id: "region", evt: "change", fn: () => validarSelect("region", "una región") },
    { id: "comuna", evt: "change", fn: () => validarSelect("comuna", "una comuna") },
    { id: "direccion", fn: () => validarNoVacio("direccion", "La dirección", 300) },
    { id: "contrasena", fn: () => validarContrasena("contrasena", 6, 20) },
    { id: "confirmarContrasena", fn: () => validarConfirmarContrasena("contrasena", "confirmarContrasena") }
  ];

  inputs.forEach(({ id, evt = "blur", fn }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
  });
}

// 3. CONTACTO
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

  const nombreInput = document.getElementById("nombre");
  const correoInput = document.getElementById("correo");
  const comentarioInput = document.getElementById("comentario");

  if (nombreInput) nombreInput.addEventListener("blur", () => validarNoVacio("nombre", "El nombre", 100));
  if (correoInput) correoInput.addEventListener("blur", () => validarCorreo("correo", true));
  if (comentarioInput) comentarioInput.addEventListener("blur", () => validarNoVacio("comentario", "El comentario", 500));
}

// ==================== DISPARADOR PRINCIPAL ====================
document.addEventListener("DOMContentLoaded", function () {
  inicializarValidacionLogin();
  inicializarValidacionRegistro();
  inicializarValidacionContacto();
});