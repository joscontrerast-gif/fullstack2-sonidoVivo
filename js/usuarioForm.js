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
      "Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com"
    );
    return false;
  }

  limpiarError(inputId);
  return true;
}

function validarContrasena(inputId, min = 6, max = 20, esEdicion = false) {
  const input = document.getElementById(inputId);
  if (!input) return false;
  const valor = input.value;

  if (valor === "" && esEdicion) {
    limpiarError(inputId);
    return true;
  }

  if (valor === "") {
    mostrarError(inputId, "La contraseña es obligatoria.");
    return false;
  }
  if (valor.length < min || valor.length > max) {
    mostrarError(
      inputId,
      `La contraseña debe tener entre ${min} y ${max} caracteres.`
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
      `${nombreCampo} no puede superar los ${maxLength} caracteres.`
    );
    return false;
  }
  limpiarError(inputId);
  return true;
}

function validarConfirmarContrasena(inputIdOriginal, inputIdConfirmar, esEdicion = false) {
  const inputOrig = document.getElementById(inputIdOriginal);
  const inputConf = document.getElementById(inputIdConfirmar);
  if (!inputOrig || !inputConf) return false;

  const original = inputOrig.value;
  const confirmar = inputConf.value;

  if (esEdicion && original === "" && confirmar === "") {
    limpiarError(inputIdConfirmar);
    return true;
  }

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
      "El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guion."
    );
    return false;
  }

  const cuerpo = valor.slice(0, -1);
  const dv = valor.slice(-1);

  if (!/^\d+$/.test(cuerpo)) {
    mostrarError(
      inputId,
      "El RUN solo debe contener números y el dígito verificador."
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

// ==================== LÓGICA EXCLUSIVA PARA CLIENTES ====================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formUsuarioAdmin");
  const inputRun = document.getElementById("run");
  const inputNombre = document.getElementById("nombre");
  const inputApellidos = document.getElementById("apellidos");
  const inputCorreo = document.getElementById("correo");
  const selectRegion = document.getElementById("region");
  const selectComuna = document.getElementById("comuna");
  const inputDireccion = document.getElementById("direccion");
  const inputPass = document.getElementById("contrasena");

  const btnCancelar = document.getElementById("btnCancelar");
  const btnEliminar = document.getElementById("btnEliminarUsuario");
  const seccionEliminar = document.getElementById("seccionEliminar");
  const tituloFormulario = document.getElementById("tituloFormulario");

  let usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];

  const urlParams = new URLSearchParams(window.location.search);
  const runEditar = urlParams.get("run");
  const esModoEdicion = Boolean(runEditar);

  if (esModoEdicion) {
    tituloFormulario.textContent = "Editar Cliente";
    const clienteEncontrado = usuariosGuardados.find(
      (u) => u.run === runEditar.toUpperCase().replace(/\./g, "").replace(/-/g, "")
    );

    if (clienteEncontrado) {
      inputRun.value = clienteEncontrado.run;
      inputRun.readOnly = true;
      inputNombre.value = clienteEncontrado.nombre || "";
      inputApellidos.value = clienteEncontrado.apellidos || "";
      inputCorreo.value = clienteEncontrado.correo || "";
      selectRegion.value = clienteEncontrado.region || "";
      selectComuna.value = clienteEncontrado.comuna || "";
      inputDireccion.value = clienteEncontrado.direccion || "";

      if (seccionEliminar) seccionEliminar.style.display = "block";
    }
  } else {
    tituloFormulario.textContent = "Nuevo Cliente";
  }

  // LISTENERS DE VALIDACIÓN
  const inputsEventos = [
    { id: "run", fn: () => validarRun("run") },
    { id: "nombre", fn: () => validarNoVacio("nombre", "El nombre", 50) },
    { id: "apellidos", fn: () => validarNoVacio("apellidos", "Los apellidos", 100) },
    { id: "correo", fn: () => validarCorreo("correo") },
    { id: "region", evt: "change", fn: () => validarSelect("region", "una región") },
    { id: "comuna", evt: "change", fn: () => validarSelect("comuna", "una comuna") },
    { id: "direccion", fn: () => validarNoVacio("direccion", "La dirección", 300) },
    { id: "contrasena", fn: () => validarContrasena("contrasena", 6, 20, esModoEdicion) },
    { id: "confirmarContrasena", fn: () => validarConfirmarContrasena("contrasena", "confirmarContrasena", esModoEdicion) }
  ];

  inputsEventos.forEach(({ id, evt = "blur", fn }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
  });

  // SUBMIT
  if (form) {
    form.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const runValido = esModoEdicion ? true : validarRun("run");
      const nombreValido = validarNoVacio("nombre", "El nombre", 50);
      const apellidosValidos = validarNoVacio("apellidos", "Los apellidos", 100);
      const correoValido = validarCorreo("correo");
      const regionValida = validarSelect("region", "una región");
      const comunaValida = validarSelect("comuna", "una comuna");
      const direccionValida = validarNoVacio("direccion", "La dirección", 300);
      const passValida = validarContrasena("contrasena", 6, 20, esModoEdicion);
      const confPassValida = validarConfirmarContrasena("contrasena", "confirmarContrasena", esModoEdicion);

      const formularioValido =
        runValido &&
        nombreValido &&
        apellidosValidos &&
        correoValido &&
        regionValida &&
        comunaValida &&
        direccionValida &&
        passValida &&
        confPassValida;

      if (!formularioValido) return;

      const runClean = inputRun.value.trim().toUpperCase().replace(/\./g, "").replace(/-/g, "");
      const correoValue = inputCorreo.value.trim();

      const indexExistente = usuariosGuardados.findIndex((u) => u.run === runClean);

      if (!esModoEdicion) {
        const existeDuplicado = usuariosGuardados.some(
          (u) => u.run === runClean || u.correo.toLowerCase() === correoValue.toLowerCase()
        );

        if (existeDuplicado) {
          mostrarError("run", "El RUN o Correo ya se encuentra registrado.");
          mostrarError("correo", "El RUN o Correo ya se encuentra registrado.");
          return;
        }
      }

      const clienteGuardar = {
        run: runClean,
        nombre: inputNombre.value.trim(),
        apellidos: inputApellidos.value.trim(),
        correo: correoValue,
        tipoUsuario: "Cliente", // Forzado a Cliente
        region: selectRegion.value,
        comuna: selectComuna.value,
        direccion: inputDireccion.value.trim(),
        password: inputPass.value !== "" 
          ? inputPass.value 
          : (indexExistente !== -1 ? usuariosGuardados[indexExistente].password : "123456"),
        fechaRegistro: (indexExistente !== -1 && usuariosGuardados[indexExistente].fechaRegistro) 
          ? usuariosGuardados[indexExistente].fechaRegistro 
          : new Date().toISOString().split("T")[0],
        estado: "Activo"
      };

      if (indexExistente !== -1) {
        usuariosGuardados[indexExistente] = clienteGuardar;
        alert("Cliente actualizado con éxito.");
      } else {
        usuariosGuardados.push(clienteGuardar);
        alert("Cliente registrado con éxito.");
      }

      localStorage.setItem("usuarios", JSON.stringify(usuariosGuardados));
      window.location.href = "adminUsuarios.html";
    });
  }

  // CANCELAR
  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      window.location.href = "adminUsuarios.html";
    });
  }

  // ELIMINAR CLIENTE
  if (btnEliminar) {
    btnEliminar.addEventListener("click", () => {
      const runClean = inputRun.value.trim().toUpperCase().replace(/\./g, "").replace(/-/g, "");

      if (confirm(`¿Estás seguro de que deseas eliminar al cliente con RUN "${runClean}"?`)) {
        usuariosGuardados = usuariosGuardados.filter((u) => u.run !== runClean);
        localStorage.setItem("usuarios", JSON.stringify(usuariosGuardados));
        alert("Cliente eliminado correctamente.");
        window.location.href = "adminUsuarios.html";
      }
    });
  }
});