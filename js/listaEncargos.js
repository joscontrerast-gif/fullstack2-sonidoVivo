const CLAVE_ENCARGOS = "listaEncargos";

// Datos de prueba iniciales si el almacenamiento está vacío
const encargosIniciales = [
  { id: "ORD-001", fecha: "2026-03-10", cliente: "Ana Torres", correo: "ana@duoc.cl", total: 45990, estado: "Pendiente" },
  { id: "ORD-002", fecha: "2026-03-12", cliente: "Juan Pérez", correo: "juan@duoc.cl", total: 129900, estado: "En Proceso" },
  { id: "ORD-003", fecha: "2026-03-14", cliente: "María Silva", correo: "maria@duoc.cl", total: 24990, estado: "Completado" }
];

// Obtener encargos desde localStorage
function obtenerEncargos() {
  const datos = localStorage.getItem(CLAVE_ENCARGOS);
  if (!datos) {
    localStorage.setItem(CLAVE_ENCARGOS, JSON.stringify(encargosIniciales));
    return encargosIniciales;
  }
  return JSON.parse(datos);
}

// Guardar encargos actualizados
function guardarEncargos(encargos) {
  localStorage.setItem(CLAVE_ENCARGOS, JSON.stringify(encargos));
}

// Renderizar la tabla con soporte de filtros
function renderizarTablaEncargos(filtroEstado = "todos") {
  const tbody = document.getElementById("tablaEncargosBody");
  if (!tbody) return;

  const encargos = obtenerEncargos();
  tbody.innerHTML = "";

  const encargosFiltrados = encargos.filter(item => {
    return filtroEstado === "todos" || item.estado === filtroEstado;
  });

  if (encargosFiltrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" align="center">No hay encargos registrados.</td></tr>`;
    return;
  }

  // Desplegar primero las órdenes más recientes
  [...encargosFiltrados].reverse().forEach(encargo => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${encargo.id}</strong></td>
      <td>${encargo.fecha}</td>
      <td>${encargo.cliente}</td>
      <td>$${Number(encargo.total || 0).toLocaleString("es-CL")}</td>
      <td>
        <select onchange="cambiarEstadoEncargo('${encargo.id}', this.value)">
          <option value="Pendiente" ${encargo.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="En Proceso" ${encargo.estado === "En Proceso" ? "selected" : ""}>En Proceso</option>
          <option value="Completado" ${encargo.estado === "Completado" ? "selected" : ""}>Completado</option>
          <option value="Cancelado" ${encargo.estado === "Cancelado" ? "selected" : ""}>Cancelado</option>
        </select>
      </td>
      <td>
        <button type="button" onclick="verDetalleEncargo('${encargo.id}')">Ver Detalle</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Cambiar el estado de un encargo dinámicamente
function cambiarEstadoEncargo(id, nuevoEstado) {
  let encargos = obtenerEncargos();
  encargos = encargos.map(item => {
    if (item.id === id) {
      return { ...item, estado: nuevoEstado };
    }
    return item;
  });

  guardarEncargos(encargos);
  alert(`El estado del encargo ${id} fue actualizado a: ${nuevoEstado}`);
}

// Ver detalle de la orden
function verDetalleEncargo(id) {
  const encargos = obtenerEncargos();
  const encargo = encargos.find(item => item.id === id);
  if (encargo) {
    alert(`DETALLE DE LA ÓRDEN:\n\nN° Orden: ${encargo.id}\nFecha: ${encargo.fecha}\nCliente: ${encargo.cliente}\nCorreo: ${encargo.correo || 'N/A'}\nTotal: $${Number(encargo.total || 0).toLocaleString("es-CL")}\nEstado: ${encargo.estado}`);
  }
}

// Inicialización de eventos al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  renderizarTablaEncargos();

  const selectFiltro = document.getElementById("filtroEstadoEncargo");
  if (selectFiltro) {
    selectFiltro.addEventListener("change", (e) => {
      renderizarTablaEncargos(e.target.value);
    });
  }
});