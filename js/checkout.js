const CLAVE_CARRITO = "carritoSonidoVivo";
const CLAVE_PRODUCTOS = "productosSonidoVivo";

const formulario = document.getElementById("form-checkout");
const mensaje = document.getElementById("mensaje-confirmacion");

const entrega = document.getElementById("entrega");
const direccion = document.getElementById("direccion");
const direccionContainer = document.getElementById("direccion-container");


// Mostrar u ocultar dirección según tipo de entrega
entrega.addEventListener("change", function () {

    if (entrega.value === "retiro") {

        direccionContainer.style.display = "none";

        direccion.required = false;

        direccion.value = "";

    } else {

        direccionContainer.style.display = "block";

        direccion.required = true;
    }
});


// Confirmar pedido
formulario.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Obtener carrito
    const carrito = JSON.parse(
        localStorage.getItem(CLAVE_CARRITO)
    ) || [];


    // Verificar carrito vacío
    if (carrito.length === 0) {

        mensaje.innerHTML = `
            <p>
                No puedes realizar la compra porque
                tu carrito está vacío.
            </p>

            <a href="productos.html">
                Volver a productos
            </a>
        `;

        return;
    }


    try {

        // Obtener productos
        const respuesta = await fetch("data/productos.json");

        const productos = await respuesta.json();


        // Obtener datos del cliente
        const nombre =
            document.getElementById("nombre").value;

        const email =
            document.getElementById("email").value;

        const tipoEntrega =
            entrega.value;


        // Buscar productos y descontar stock
        for (const item of carrito) {

            const producto = productos.find(
                producto => producto.codigo === item.codigo
            );


            if (!producto) {
                continue;
            }


            // Verificar stock suficiente
            if (producto.stock < item.cantidad) {

                mensaje.innerHTML = `
                    <p>
                        No hay suficiente stock para:
                        <strong>${producto.nombre}</strong>
                    </p>

                    <p>
                        Stock disponible:
                        ${producto.stock}
                    </p>

                    <a href="carrito.html">
                        Volver al carrito
                    </a>
                `;

                return;
            }


            // Descontar stock
            producto.stock =
                producto.stock - item.cantidad;
        }


        // Guardar catálogo actualizado
        localStorage.setItem(
            CLAVE_PRODUCTOS,
            JSON.stringify(productos)
        );


        // Mostrar tipo de entrega
        let textoEntrega = "";

        if (tipoEntrega === "retiro") {

            textoEntrega = `
                Retiro en tienda
            `;

        } else {

            textoEntrega = `
                Despacho a domicilio
            `;
        }


        // Confirmación
        mensaje.innerHTML = `
            <h3>
                ¡Pedido realizado correctamente!
            </h3>

            <p>
                Gracias por tu compra,
                ${nombre}.
            </p>

            <p>
                Hemos recibido tu pedido correctamente.
            </p>

            <p>
                <strong>Correo:</strong>
                ${email}
            </p>

            <p>
                <strong>Entrega:</strong>
                ${textoEntrega}
            </p>

            <a href="productos.html">
                Volver a productos
            </a>
        `;


        // Vaciar carrito
        localStorage.removeItem(CLAVE_CARRITO);


        // Limpiar formulario
        formulario.reset();


        // Restaurar estado de dirección
        direccionContainer.style.display = "block";

        direccion.required = true;


    } catch (error) {

        console.error(
            "Error procesando pedido:",
            error
        );

        mensaje.innerHTML = `
            <p>
                No se pudo procesar el pedido.
            </p>
        `;
    }

});