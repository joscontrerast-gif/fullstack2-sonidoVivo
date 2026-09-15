document.addEventListener("DOMContentLoaded", async () => {
  const tablaBody = document.getElementById("tablaProductosBody");
  const filtroSelect = document.getElementById("filtroProductosSelect");

  if (!tablaBody) return;

  let listaProductos = [];

  const formatearPrecio = (valor) => {
    if (valor === 0) return "FREE";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 2
    }).format(valor);
  };

  function cargarCategoriasEnSelect(productos) {
    if (!filtroSelect) return;
    const categorias = [...new Set(productos.map((p) => p.categoria))];
    filtroSelect.innerHTML = `<option value="todos">Todas las Categorías</option>`;

    categorias.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      filtroSelect.appendChild(option);
    });
  }

  function renderizarTabla(productos) {
    tablaBody.innerHTML = "";

    if (productos.length === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="7" align="center">No hay productos registrados.</td>
        </tr>
      `;
      return;
    }

    productos.forEach((p) => {
      const fechaIngreso = p.fechaIngreso || new Date().toISOString().split("T")[0];
      const codigoProducto = p.codigo || p.sku;

      // Alerta de stock crítico (Si existe stockCritico y el stock es <= a este)
      let estiloStock = "";
      let etiquetaCritico = "";
      if (p.stockCritico !== null && p.stockCritico !== undefined && p.stock <= p.stockCritico) {
        estiloStock = 'style="color: red; font-weight: bold;"';
        etiquetaCritico = ' <span style="color: red;" title="¡Stock Crítico!">&#9888;</span>';
      }

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${fechaIngreso}</td>
        <td>${codigoProducto}</td>
        <td>${p.marca ? p.marca + ' ' : ''}${p.nombre}</td>
        <td>${p.categoria}</td>
        <td>${formatearPrecio(p.precio)}</td>
        <td ${estiloStock}>${p.stock}${etiquetaCritico}</td>
        <td>
          <a href="adminProductoForm.html?codigo=${codigoProducto}">Editar</a> | 
          <a href="#" class="btn-eliminar" data-codigo="${codigoProducto}" style="color: red;">Eliminar</a>
        </td>
      `;
      tablaBody.appendChild(fila);
    });

    asignarEventosEliminar();
  }

  function asignarEventosEliminar() {
    const botonesEliminar = document.querySelectorAll(".btn-eliminar");

    botonesEliminar.forEach((boton) => {
      boton.addEventListener("click", (e) => {
        e.preventDefault();
        const codigoAEliminar = boton.getAttribute("data-codigo");

        const confirmar = confirm(
          `¿Estás seguro de que deseas eliminar el producto con código "${codigoAEliminar}"?`
        );

        if (confirmar) {
          listaProductos = listaProductos.filter(
            (p) => (p.codigo || p.sku) !== codigoAEliminar
          );

          guardarProductos(listaProductos);
          cargarCategoriasEnSelect(listaProductos);
          renderizarTabla(listaProductos);
          alert("Producto eliminado con éxito.");
        }
      });
    });
  }

  try {
    listaProductos = await obtenerProductos();
    cargarCategoriasEnSelect(listaProductos);
    renderizarTabla(listaProductos);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    tablaBody.innerHTML = `
      <tr>
        <td colspan="7" align="center" style="color: red;">
          Error al cargar los productos.
        </td>
      </tr>
    `;
  }

  if (filtroSelect) {
    filtroSelect.addEventListener("change", () => {
      const categoriaSeleccionada = filtroSelect.value;
      if (categoriaSeleccionada === "todos") {
        renderizarTabla(listaProductos);
      } else {
        const filtrados = listaProductos.filter((p) => p.categoria === categoriaSeleccionada);
        renderizarTabla(filtrados);
      }
    });
  }
});