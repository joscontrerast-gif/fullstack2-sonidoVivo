document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const correoInput = document.getElementById('correoInput');
      const passwordInput = document.getElementById('passwordInput');

      const correoValue = correoInput.value.trim();
      const passwordValue = passwordInput.value.trim();

      if (correoValue === '') {
        alert('ERROR, El correo es requerido.');
        correoInput.focus();
        return;
      }

      if (correoValue.length > 100) {
        alert('El correo no puede superar los 100 caracteres.');
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

      // 2. Obtener usuarios registrados desde localStorage
      const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];

      // 3. Buscar coincidencia (CORREGIDO)
      const usuarioEncontrado = usuariosGuardados.find(
        u => u.correo.toLowerCase() === correoValue.toLowerCase() && u.password === passwordValue
      );

      // 4. Validar resultado
      if (usuarioEncontrado) {
        localStorage.setItem('usuarioActivo', JSON.stringify(usuarioEncontrado));
        
        alert(`¡Bienvenido/a, ${usuarioEncontrado.nombre}!`);
        window.location.href = 'index.html';
      } else {
        alert('El correo o la contraseña son incorrectos.');
        correoInput.focus();
      }

    });
  }
});