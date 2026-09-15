const CLAVE_ENCARGOS = "listaEncargos";

function cargarPedidosPendientes() {
  const tbody = document.getElementById("tablaPendientesBody");
  if (!tbody) return;

  const datos = localStorage.getItem(CLAVE_ENCARGOS);
  const encargos = datos ? JSON.parse(datos) : [];

  // Filtrar exclusivamente los pedidos en estado Pendiente
  const pendientes = encargos.filter(item => item.estado === "Pendiente");

  tbody.innerHTML = "";

  if (pendientes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" align="center">No hay pedidos pendientes actualmente.</td></tr>`;
    return;
  }

  // Renderizar de más reciente a más antiguo
  [...pendientes].reverse().forEach(encargo => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><strong>${encargo.id}</strong></td>
      <td>${encargo.fecha}</td>
      <td>${encargo.cliente}</td>
      <td>$${Number(encargo.total || 0).toLocaleString("es-CL")}</td>
      <td><span style="color: #e67e22; font-weight: bold;">${encargo.estado}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarPedidosPendientes();
});