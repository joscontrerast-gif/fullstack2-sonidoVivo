document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formProducto");
  const inputSku = document.getElementById("sku");
  const inputNombre = document.getElementById("nombre");
  const inputMarca = document.getElementById("marca");
  const inputModelo = document.getElementById("modelo");
  const inputDescripcion = document.getElementById("descripcion");
  const selectCategoria = document.getElementById("categoria");
  const inputPrecio = document.getElementById("precio");
  const inputStock = document.getElementById("stock");
  const inputStockCritico = document.getElementById("stockCritico");

  let productos = [];

  // Obtener parámetro URL para edición
  const urlParams = new URLSearchParams(window.location.search);
  const codigoEditar = urlParams.get("codigo") || urlParams.get("sku");

  try {
    productos = await obtenerProductos();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }

  // MODO EDICIÓN: Precarga de campos
  if (codigoEditar) {
    const productoEncontrado = productos.find(
      (p) => p.codigo === codigoEditar || p.sku === codigoEditar
    );

    if (productoEncontrado) {
      if (inputSku) {
        inputSku.value = productoEncontrado.codigo || productoEncontrado.sku || "";
        inputSku.readOnly = true;
      }
      if (inputNombre) inputNombre.value = productoEncontrado.nombre || "";
      if (inputMarca) inputMarca.value = productoEncontrado.marca || "";
      if (inputModelo) inputModelo.value = productoEncontrado.modelo || "";
      if (inputDescripcion) inputDescripcion.value = productoEncontrado.descripcion || "";
      if (selectCategoria) selectCategoria.value = productoEncontrado.categoria || "";
      if (inputPrecio) inputPrecio.value = productoEncontrado.precio ?? "";
      if (inputStock) inputStock.value = productoEncontrado.stock ?? "";
      if (inputStockCritico) inputStockCritico.value = productoEncontrado.stockCritico ?? "";
    }
  }

  // PROCESAMIENTO Y VALIDACIONES DEL FORMULARIO
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const codigoVal = inputSku.value.trim().toUpperCase();
      const nombreVal = inputNombre.value.trim();
      const descripcionVal = inputDescripcion ? inputDescripcion.value.trim() : "";
      const categoriaVal = selectCategoria ? selectCategoria.value : "";
      const precioVal = parseFloat(inputPrecio.value);
      const stockVal = Number(inputStock.value);
      const stockCriticoVal = inputStockCritico && inputStockCritico.value !== "" 
        ? Number(inputStockCritico.value) 
        : null;

      // 1. Validaciones de Código 
      if (!codigoVal || codigoVal.length < 3) {
        alert("El Código del producto debe tener al menos 3 caracteres.");
        inputSku.focus();
        return;
      }

      // 2. Validación de Nombre 
      if (!nombreVal || nombreVal.length > 100) {
        alert("El Nombre es obligatorio y no puede superar los 100 caracteres.");
        inputNombre.focus();
        return;
      }

      // 3. Validación de Descripción 
      if (descripcionVal.length > 500) {
        alert("La Descripción no puede superar los 500 caracteres.");
        inputDescripcion.focus();
        return;
      }

      // 4. Validación de Categoría 
      if (!categoriaVal) {
        alert("Debes seleccionar una Categoría.");
        selectCategoria.focus();
        return;
      }

      // 5. Validación de Precio 
      if (isNaN(precioVal) || precioVal < 0) {
        alert("El Precio es obligatorio y debe ser mayor o igual a 0.");
        inputPrecio.focus();
        return;
      }

      // 6. Validación de Stock 
      if (isNaN(stockVal) || stockVal < 0 || !Number.isInteger(stockVal)) {
        alert("El Stock es obligatorio, debe ser un número entero mayor o igual a 0.");
        inputStock.focus();
        return;
      }

      // 7. Validación de Stock Crítico 
      if (stockCriticoVal !== null && (isNaN(stockCriticoVal) || stockCriticoVal < 0 || !Number.isInteger(stockCriticoVal))) {
        alert("El Stock Crítico debe ser un número entero mayor o igual a 0.");
        inputStockCritico.focus();
        return;
      }

      // 8. Control de Duplicados en SKU/Código
      const indexExistente = productos.findIndex(
        (p) => (p.codigo && p.codigo.toUpperCase() === codigoVal) || 
               (p.sku && p.sku.toUpperCase() === codigoVal)
      );

      if (!codigoEditar && indexExistente !== -1) {
        alert(`Error: Ya existe un producto registrado con el código "${codigoVal}".`);
        inputSku.focus();
        return;
      }

      // Construcción del objeto de producto
      const productoGuardar = {
        codigo: codigoVal,
        sku: codigoVal,
        nombre: nombreVal,
        marca: inputMarca ? inputMarca.value.trim() : "",
        modelo: inputModelo ? inputModelo.value.trim() : "",
        descripcion: descripcionVal,
        categoria: categoriaVal,
        precio: precioVal,
        stock: stockVal,
        stockCritico: stockCriticoVal,
        fechaIngreso: (indexExistente !== -1 && productos[indexExistente].fechaIngreso)
          ? productos[indexExistente].fechaIngreso
          : new Date().toISOString().split("T")[0]
      };

      if (indexExistente !== -1) {
        productos[indexExistente] = productoGuardar;
        alert("Producto actualizado con éxito.");
      } else {
        productos.push(productoGuardar);
        alert("Producto creado con éxito.");
      }

      guardarProductos(productos);
      window.location.href = "adminProductos.html";
    });
  }
});