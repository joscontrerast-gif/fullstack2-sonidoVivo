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

  let productos = [];

  // Capturar parámetro 'codigo' o 'sku' pasado por la URL
  const urlParams = new URLSearchParams(window.location.search);
  const codigoEditar = urlParams.get("codigo") || urlParams.get("sku");

  try {
    // Usamos la función del archivo js/productos.js
    productos = await obtenerProductos();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }

  // MODO EDICIÓN: Si existe parámetro en la URL, se cargan los datos del objeto
  if (codigoEditar) {
    const productoEncontrado = productos.find(
      (p) => p.codigo === codigoEditar || p.sku === codigoEditar
    );

    if (productoEncontrado) {
      if (inputSku) {
        inputSku.value = productoEncontrado.codigo || productoEncontrado.sku || "";
        inputSku.readOnly = true; // Bloquea el campo SKU/Código al editar
      }
      if (inputNombre) inputNombre.value = productoEncontrado.nombre || "";
      if (inputMarca) inputMarca.value = productoEncontrado.marca || "";
      if (inputModelo) inputModelo.value = productoEncontrado.modelo || "";
      if (inputDescripcion) inputDescripcion.value = productoEncontrado.descripcion || "";
      if (selectCategoria) selectCategoria.value = productoEncontrado.categoria || "";
      if (inputPrecio) inputPrecio.value = productoEncontrado.precio || 0;
      if (inputStock) inputStock.value = productoEncontrado.stock || 0;
    }
  }

  // GUARDAR REGISTRO (CREAR O ACTUALIZAR)
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const codigoVal = inputSku.value.trim().toUpperCase();
      const nombreVal = inputNombre.value.trim();
      const precioVal = parseFloat(inputPrecio.value);
      const stockVal = parseInt(inputStock.value, 10);

      // Validaciones básicas
      if (!codigoVal || !nombreVal || isNaN(precioVal) || isNaN(stockVal)) {
        alert("Por favor completa los campos requeridos correctamente.");
        return;
      }

      // Buscar si el código ya existe en el arreglo
      const indexExistente = productos.findIndex(
        (p) => (p.codigo && p.codigo.toUpperCase() === codigoVal) || 
               (p.sku && p.sku.toUpperCase() === codigoVal)
      );

      // VALIDACIÓN DE DUPLICADOS: Si NO estamos editando y el SKU ya existe
      if (!codigoEditar && indexExistente !== -1) {
        alert(`Error: Ya existe un producto registrado con el SKU/Código "${codigoVal}".`);
        inputSku.focus();
        return; // Detiene el flujo de guardado
      }

      // Objeto mapeado a las claves de tu JSON
      const productoGuardar = {
        codigo: codigoVal,
        sku: codigoVal,
        categoria: selectCategoria ? selectCategoria.value : "General",
        nombre: nombreVal,
        marca: inputMarca ? inputMarca.value.trim() : "Genérica",
        modelo: inputModelo ? inputModelo.value.trim() : "Estándar",
        stock: stockVal,
        precio: precioVal,
        descripcion: inputDescripcion ? inputDescripcion.value.trim() : "",
        fechaIngreso: (indexExistente !== -1 && productos[indexExistente].fechaIngreso)
          ? productos[indexExistente].fechaIngreso
          : new Date().toISOString().split("T")[0]
      };

      if (indexExistente !== -1) {
        // Actualiza el producto existente
        productos[indexExistente] = productoGuardar;
        alert("Producto actualizado con éxito.");
      } else {
        // Agrega el producto nuevo al arreglo
        productos.push(productoGuardar);
        alert("Producto creado con éxito.");
      }

      // Guarda la lista actualizada en localStorage mediante js/productos.js
      guardarProductos(productos);

      // Redirige al listado principal de productos
      window.location.href = "adminProductos.html";
    });
  }
});