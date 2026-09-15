const CLAVE_CARRITO = "carritoSonidoVivo";
const CLAVE_PRODUCTOS = "productosSonidoVivo";
const CLAVE_ENCARGOS = "listaEncargos"; // Clave que comparte con la vista del Admin

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
    const carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO)) || [];

    // Verificar carrito vacío
    if (carrito.length === 0) {
        mensaje.innerHTML = `
            <p>No puedes realizar la compra porque tu carrito está vacío.</p>
            <a href="productos.html">Volver a productos</a>
        `;
        return;
    }

    try {
        // 1. Obtener productos (Priorizar localStorage para mantener cambios de stock, si no leer del JSON)
        let productos = JSON.parse(localStorage.getItem(CLAVE_PRODUCTOS));
        if (!productos) {
            const respuesta = await fetch("data/productos.json");
            productos = await respuesta.json();
        }

        // Obtener datos del cliente
        const nombre = document.getElementById("nombre").value;
        const email = document.getElementById("email").value;
        const tipoEntrega = entrega.value;

        let totalPedido = 0;

        // 2. Verificar stock suficiente y calcular el total
        for (const item of carrito) {
            const producto = productos.find(prod => prod.codigo === item.codigo);

            if (!producto) continue;

            if (producto.stock < item.cantidad) {
                mensaje.innerHTML = `
                    <p>No hay suficiente stock para: <strong>${producto.nombre}</strong></p>
                    <p>Stock disponible: ${producto.stock}</p>
                    <a href="carrito.html">Volver al carrito</a>
                `;
                return;
            }

            // Descontar stock local
            producto.stock -= item.cantidad;
            // Sumar al total acumulado (si item.precio no viene en el carrito, se busca en el catálogo)
            totalPedido += (item.precio || producto.precio || 0) * item.cantidad;
        }

        // 3. Guardar stock actualizado en localStorage
        localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));

        // 4. CREAR Y GUARDAR EL ENCARGO PARA EL ADMIN
        const encargosExistentes = JSON.parse(localStorage.getItem(CLAVE_ENCARGOS)) || [];
        
        const nuevoEncargo = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, // Genera ID como ORD-4582
            fecha: new Date().toISOString().split("T")[0],         // Formato YYYY-MM-DD
            cliente: nombre,
            correo: email,
            total: totalPedido,
            tipoEntrega: tipoEntrega,
            estado: "Pendiente"                                   // Estado inicial por defecto
        };

        encargosExistentes.push(nuevoEncargo);
        localStorage.setItem(CLAVE_ENCARGOS, JSON.stringify(encargosExistentes));

        // Texto de entrega
        const textoEntrega = tipoEntrega === "retiro" ? "Retiro en tienda" : "Despacho a domicilio";

        // Confirmación en pantalla
        mensaje.innerHTML = `
            <h3>¡Pedido realizado correctamente!</h3>
            <p>Gracias por tu compra, ${nombre}.</p>
            <p>Hemos recibido tu pedido correctamente (N° Orden: <strong>${nuevoEncargo.id}</strong>).</p>
            <p><strong>Correo:</strong> ${email}</p>
            <p><strong>Entrega:</strong> ${textoEntrega}</p>
            <a href="productos.html">Volver a productos</a>
        `;

        // Vaciar carrito y limpiar formulario
        localStorage.removeItem(CLAVE_CARRITO);
        formulario.reset();
        direccionContainer.style.display = "block";
        direccion.required = true;

    } catch (error) {
        console.error("Error procesando pedido:", error);
        mensaje.innerHTML = `<p>No se pudo procesar el pedido.</p>`;
    }
});