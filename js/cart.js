const CLAVE_CARRITO = "carritoSonidoVivo";


// Obtener carrito desde LocalStorage
function obtenerCarrito() {

    const carritoGuardado = localStorage.getItem(CLAVE_CARRITO);

    if (carritoGuardado) {
        return JSON.parse(carritoGuardado);
    }

    return [];
}


// Guardar carrito en LocalStorage
function guardarCarrito(carrito) {

    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );
}


// Agregar producto al carrito
function agregarAlCarrito(codigo) {

    const carrito = obtenerCarrito();

    const productoExistente = carrito.find(
        producto => producto.codigo === codigo
    );

    if (productoExistente) {

        productoExistente.cantidad++;

    } else {

        carrito.push({
            codigo: codigo,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);

    alert("Producto agregado al carrito");
}


// Aumentar cantidad
function aumentarCantidad(codigo) {

    const carrito = obtenerCarrito();

    const producto = carrito.find(
        producto => producto.codigo === codigo
    );

    if (producto) {
        producto.cantidad++;
    }

    guardarCarrito(carrito);

    mostrarCarrito();
}


// Disminuir cantidad
function disminuirCantidad(codigo) {

    const carrito = obtenerCarrito();

    const producto = carrito.find(
        producto => producto.codigo === codigo
    );

    if (producto && producto.cantidad > 1) {
        producto.cantidad--;
    }

    guardarCarrito(carrito);

    mostrarCarrito();
}


// Mostrar carrito
async function mostrarCarrito() {

    const contenedor = document.getElementById("carrito-container");

    // Si estamos en otra página, no hacer nada
    if (!contenedor) {
        return;
    }

    const carrito = obtenerCarrito();

    // Carrito vacío
    if (carrito.length === 0) {

        contenedor.innerHTML = `
            <p>Tu carrito está vacío.</p>

            <a href="productos.html">
                Ver productos
            </a>
        `;

        return;
    }

    try {

        const productos = await obtenerProductos();

        let total = 0;

        // Limpiar contenido anterior
        contenedor.innerHTML = "";


        // Mostrar productos
        carrito.forEach(item => {

            const producto = productos.find(
                producto => producto.codigo === item.codigo
            );

            if (!producto) {
                return;
            }

            const subtotal =
                producto.precio * item.cantidad;

            total += subtotal;


            const elemento =
                document.createElement("article");

            elemento.classList.add("item-carrito");


            elemento.innerHTML = `
                <h3>
                    ${producto.nombre}
                </h3>

                <p>
                    <strong>Marca:</strong>
                    ${producto.marca}
                </p>

                <p>
                    <strong>Precio:</strong>
                    $${producto.precio.toLocaleString("es-CL")}
                </p>

                <div class="cantidad-carrito">

                    <strong>Cantidad:</strong>

                    <button
                        onclick="disminuirCantidad('${producto.codigo}')">
                        −
                    </button>

                    <span>
                        ${item.cantidad}
                    </span>

                    <button
                        onclick="aumentarCantidad('${producto.codigo}')">
                        +
                    </button>

                </div>

                <p>
                    <strong>Subtotal:</strong>
                    $${subtotal.toLocaleString("es-CL")}
                </p>

                <button
                    onclick="eliminarDelCarrito('${producto.codigo}')">
                    Eliminar
                </button>
            `;


            contenedor.appendChild(elemento);
        });


        // Calcular IVA
        const iva = total * 0.19;


        // Calcular total final
        const totalFinal = total + iva;


        // Crear resumen
        const resumen =
            document.createElement("div");

        resumen.classList.add("resumen-carrito");


        resumen.innerHTML = `
            <h3>
                Resumen de compra
            </h3>

            <p>
                <strong>Subtotal:</strong>
                $${total.toLocaleString("es-CL")}
            </p>

            <p>
                <strong>IVA (19%):</strong>
                $${iva.toLocaleString("es-CL")}
            </p>

            <p>
                <strong>Total:</strong>
                $${totalFinal.toLocaleString("es-CL")}
            </p>

            <button onclick="vaciarCarrito()">
                Vaciar carrito
            </button>

            <button onclick="irAlCheckout()">
                Continuar compra
            </button>
        `;


        contenedor.appendChild(resumen);

    } catch (error) {

        console.error(
            "Error cargando carrito:",
            error
        );

        contenedor.innerHTML = `
            <p>
                No se pudo cargar el carrito.
            </p>
        `;
    }
}


// Eliminar producto
function eliminarDelCarrito(codigo) {

    let carrito = obtenerCarrito();

    carrito = carrito.filter(
        producto => producto.codigo !== codigo
    );

    guardarCarrito(carrito);

    mostrarCarrito();
}


// Ir al checkout
function irAlCheckout() {

    window.location.href = "checkout.html";
}


// Vaciar carrito
function vaciarCarrito() {

    localStorage.removeItem(CLAVE_CARRITO);

    mostrarCarrito();
}


// Cargar carrito al abrir la página
mostrarCarrito();