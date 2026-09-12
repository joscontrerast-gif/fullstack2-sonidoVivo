document.addEventListener('DOMContentLoaded', () => {
  const usuarioForm = document.getElementById('usuarioForm');

  const regionesYComunas = [
    {
      region: "Región de Valparaíso",
      comunas: ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "Concón"]
    },
    {
      region: "Región Metropolitana",
      comunas: ["Santiago", "Providencia", "Las Condes", "Maipú", "Puente Alto"]
    },
    {
      region: "Región del Biobío",
      comunas: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Chiguayante"]
    }
  ];

  const regionSelect = document.getElementById('regionSelect');
  const comunaSelect = document.getElementById('comunaSelect');

  regionesYComunas.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.region;
    regionSelect.appendChild(option);
  });

  regionSelect.addEventListener('change', () => {
    const regionIndex = regionSelect.value;
    comunaSelect.innerHTML = '<option value="" selected disabled>Seleccione una comuna...</option>';

    if (regionIndex !== "") {
      const comunas = regionesYComunas[regionIndex].comunas;
      comunas.forEach(comuna => {
        const option = document.createElement('option');
        option.value = comuna;
        option.textContent = comuna;
        comunaSelect.appendChild(option);
      });
    }
  });

  function evaluarRutChileno(rut) {
    const regexRut = /^[0-9]{7,8}[0-9kK]{1}$/;

    if (!regexRut.test(rut)) {
      return { valido: false, razon: 'FORMATO' };
    }

    const cuerpo = rut.slice(0, -1);
    const dvIngresado = rut.slice(-1).toUpperCase();

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i), 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvCalculado = '';

    if (dvEsperado === 11) dvCalculado = '0';
    else if (dvEsperado === 10) dvCalculado = 'K';
    else dvCalculado = dvEsperado.toString();

    if (dvIngresado !== dvCalculado) {
      return { valido: false, razon: 'MATEMATICA' };
    }

    return { valido: true };
  }

  if (usuarioForm) {
    usuarioForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const runInput = document.getElementById('runInput');
      const nombreInput = document.getElementById('nombreInput');
      const apellidosInput = document.getElementById('apellidosInput');
      const correoInput = document.getElementById('correoInput');
      const passwordInput = document.getElementById('passwordInput'); // Captura input clave
      const fechaNacimientoInput = document.getElementById('fechaNacimientoInput');
      const tipoUsuarioSelect = document.getElementById('tipoUsuarioSelect');
      const direccionInput = document.getElementById('direccionInput');

      const runValue = runInput.value.trim().toUpperCase();
      const nombreValue = nombreInput.value.trim();
      const apellidosValue = apellidosInput.value.trim();
      const correoValue = correoInput.value.trim();
      const passwordValue = passwordInput.value.trim(); // Obtener valor clave
      const fechaNacimientoValue = fechaNacimientoInput.value;
      const direccionValue = direccionInput.value.trim();

      // --- VALIDACIÓN RUN ---
      if (runValue === '') {
        alert('El RUN es requerido.');
        runInput.focus();
        return;
      }

      const resultadoRut = evaluarRutChileno(runValue);
      if (!resultadoRut.valido) {
        if (resultadoRut.razon === 'FORMATO') {
          alert('Formato de RUN inválido. Ingrésalo sin puntos ni guion (Ej: 19011022K).');
        } else if (resultadoRut.razon === 'MATEMATICA') {
          alert('RUN inválido: El dígito verificador no coincide.');
        }
        runInput.focus();
        return;
      }

      // --- VALIDACIÓN NOMBRE ---
      if (nombreValue === '' || nombreValue.length > 50) {
        alert('El Nombre es requerido y no puede superar los 50 caracteres.');
        nombreInput.focus();
        return;
      }

      // --- VALIDACIÓN APELLIDOS ---
      if (apellidosValue === '' || apellidosValue.length > 100) {
        alert('Los Apellidos son requeridos y no pueden superar los 100 caracteres.');
        apellidosInput.focus();
        return;
      }

      // --- VALIDACIÓN CORREO ---
      if (correoValue === '' || correoValue.length > 100) {
        alert('El correo es requerido y no puede superar los 100 caracteres.');
        correoInput.focus();
        return;
      }

      const dominiosPermitidos = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
      const correoValido = dominiosPermitidos.some(dominio => correoValue.endsWith(dominio));

      if (!correoValido) {
        alert('El correo debe terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com.');
        correoInput.focus();
        return;
      }

      // --- VALIDACIÓN CONTRASEÑA ---
      if (passwordValue === '') {
        alert('La contraseña es requerida.');
        passwordInput.focus();
        return;
      }
      if (passwordValue.length < 4 || passwordValue.length > 10) {
        alert('La contraseña debe tener entre 4 y 10 caracteres.');
        passwordInput.focus();
        return;
      }

      // --- VALIDACIÓN SELECTIONS ---
      if (tipoUsuarioSelect.value === '') {
        alert('Debe seleccionar un Tipo de Usuario.');
        tipoUsuarioSelect.focus();
        return;
      }

      if (regionSelect.value === '') {
        alert('Debe seleccionar una Región.');
        regionSelect.focus();
        return;
      }

      if (comunaSelect.value === '') {
        alert('Debe seleccionar una Comuna.');
        comunaSelect.focus();
        return;
      }

      // --- VALIDACIÓN DIRECCIÓN ---
      if (direccionValue === '' || direccionValue.length > 300) {
        alert('La Dirección es requerida y no puede superar los 300 caracteres.');
        direccionInput.focus();
        return;
      }

      // --- GUARDADO EN LOCALSTORAGE ---
      const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];

      const yaExiste = usuariosGuardados.some(u => u.run === runValue || u.correo === correoValue);
      if (yaExiste) {
        alert('Ya existe un usuario registrado con este RUN o Correo.');
        return;
      }

      const nuevoUsuario = {
        run: runValue,
        nombre: nombreValue,
        apellidos: apellidosValue,
        correo: correoValue,
        password: passwordValue, // Se incluye la contraseña en el objeto guardado
        fechaNacimiento: fechaNacimientoValue || 'No especificada',
        tipoUsuario: tipoUsuarioSelect.value,
        region: regionesYComunas[regionSelect.value].region,
        comuna: comunaSelect.value,
        direccion: direccionValue
      };

      usuariosGuardados.push(nuevoUsuario);
      localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));

      alert('¡Usuario guardado con éxito!');
      
      usuarioForm.reset();
      comunaSelect.innerHTML = '<option value="" selected disabled>Seleccione una comuna...</option>';
    });
  }
});