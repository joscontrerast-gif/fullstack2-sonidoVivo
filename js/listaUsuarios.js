document.addEventListener('DOMContentLoaded', () => {
  const tablaBody = document.getElementById('tablaUsuariosBody');

  if (!tablaBody) return;

  // 1. Obtener la lista general de usuarios desde localStorage
  const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];

  // 2. Filtrar para obtener ÚNICAMENTE los usuarios con rol 'Cliente'
  const clientes = usuariosGuardados.filter(usuario => usuario.tipoUsuario === 'Cliente');

  // 3. Limpiar contenido previo del tbody
  tablaBody.innerHTML = '';

  // 4. Si no hay clientes registrados, mostrar mensaje
  if (clientes.length === 0) {
    tablaBody.innerHTML = `
      <tr>
        <td colspan="7" align="center">No hay clientes registrados en el sistema.</td>
      </tr>
    `;
    return;
  }

  // 5. Renderizar únicamente los clientes filtrados
  clientes.forEach((usuario, index) => {
    const fechaRegistro = usuario.fechaRegistro || new Date().toISOString().split('T')[0];
    const idUsuario = `U${String(index + 1).padStart(4, '0')}`;
    const nombreCompleto = `${usuario.nombre} ${usuario.apellidos}`;
    const estado = usuario.estado || 'Activo';

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${fechaRegistro}</td>
      <td>${idUsuario}</td>
      <td>${nombreCompleto}</td>
      <td>${usuario.correo}</td>
      <td>${usuario.tipoUsuario}</td>
      <td>${estado}</td>
      <td><a href="adminUsuarioForm.html?run=${usuario.run}">Editar</a></td>
    `;

    tablaBody.appendChild(fila);
  });
});