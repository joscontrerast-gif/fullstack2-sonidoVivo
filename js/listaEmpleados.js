document.addEventListener('DOMContentLoaded', () => {
  const tablaBody = document.getElementById('tablaEmpleadosBody');
  const filtroSelect = document.getElementById('filtroEmpleadosSelect');

  if (!tablaBody) return;

  const todosLosUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  const rolesEmpleado = ['Empleado', 'Vendedor', 'Administrador'];
  const baseEmpleados = todosLosUsuarios.filter(u => rolesEmpleado.includes(u.tipoUsuario));

  // Función encargada de dibujar la tabla según el filtro del <select>
  function renderizarTabla(lista) {
    tablaBody.innerHTML = '';

    if (lista.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="7" align="center">No se encontraron empleados registrados.</td>
        </tr>
      `;
      return;
    }

    lista.forEach((empleado, index) => {
      const fechaRegistro = empleado.fechaRegistro || new Date().toISOString().split('T')[0];
      const idUsuario = `U${String(index + 1).padStart(4, '0')}`;
      const nombreCompleto = `${empleado.nombre} ${empleado.apellidos}`;
      const estado = empleado.estado || 'Activo';

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${fechaRegistro}</td>
        <td>${idUsuario}</td>
        <td>${nombreCompleto}</td>
        <td>${empleado.correo}</td>
        <td>${empleado.tipoUsuario}</td>
        <td>${estado}</td>
        <td><a href="adminEmpleadoForm.html?run=${empleado.run}">Editar</a></td>
      `;

      tablaBody.appendChild(fila);
    });
  }

  renderizarTabla(baseEmpleados);


  if (filtroSelect) {
    filtroSelect.addEventListener('change', () => {
      const opcion = filtroSelect.value;

      if (opcion === 'todos') {
        renderizarTabla(baseEmpleados);
      } else if (opcion === 'Administrador') {
        const admins = baseEmpleados.filter(e => e.tipoUsuario === 'Administrador');
        renderizarTabla(admins);
      } else if (opcion === 'Empleado') {
        const personal = baseEmpleados.filter(e => e.tipoUsuario === 'Empleado' || e.tipoUsuario === 'Vendedor');
        renderizarTabla(personal);
      }
    });
  }
});