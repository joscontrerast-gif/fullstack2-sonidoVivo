document.addEventListener("DOMContentLoaded", async () => {
  const tablaBody = document.getElementById("tablaProductosBody");
  const filtroSelect = document.getElementById("filtroProductosSelect");

  if (!tablaBody) return;

  let listaProductos = [];

  // Formato para pesos chilenos ($ CLP)
  const formatearPrecio = (valor) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Genera dinámicamente las opciones del selector según las categorías existentes
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

  // Función para renderizar la tabla con opción de editar y eliminar
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

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${fechaIngreso}</td>
        <td>${codigoProducto}</td>
        <td>${p.marca} ${p.nombre} (${p.modelo})</td>
        <td>${p.categoria}</td>
        <td>${formatearPrecio(p.precio)}</td>
        <td>${p.stock}</td>
        <td>
          <a href="adminProductoForm.html?codigo=${codigoProducto}">Editar</a> | 
          <a href="#" class="btn-eliminar" data-codigo="${codigoProducto}" style="color: red;">Eliminar</a>
        </td>
      `;
      tablaBody.appendChild(fila);
    });

    // Delegación de eventos para los botones de eliminar
    asignarEventosEliminar();
  }

  // Función para manejar la eliminación con confirmación
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
          // Filtrar la lista excluyendo el producto seleccionado
          listaProductos = listaProductos.filter(
            (p) => (p.codigo || p.sku) !== codigoAEliminar
          );

          // Guardar en localStorage usando la función de tu compañero
          guardarProductos(listaProductos);

          // Actualizar la vista y el selector de categorías
          cargarCategoriasEnSelect(listaProductos);
          renderizarTabla(listaProductos);

          alert("Producto eliminado con éxito.");
        }
      });
    });
  }

  // Carga inicial
  try {
    listaProductos = await obtenerProductos();
    cargarCategoriasEnSelect(listaProductos);
    renderizarTabla(listaProductos);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    tablaBody.innerHTML = `
      <tr>
        <td colspan="7" align="center" style="color: red;">
          Error al cargar el catálogo de productos.
        </td>
      </tr>
    `;
  }

  // Evento de filtro por categoría
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