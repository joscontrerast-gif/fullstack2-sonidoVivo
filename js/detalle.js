const contenedorDetalle = document.getElementById("producto-detalle");

async function cargarDetalle() {

    try {

        const productos = await obtenerProductos();

        const parametros =
            new URLSearchParams(window.location.search);

        const codigo =
            parametros.get("codigo");

        const producto =
            productos.find(
                producto => producto.codigo === codigo
            );

        if (!producto) {

            contenedorDetalle.innerHTML = `
                <h2>Producto no encontrado</h2>

                <a href="productos.html">
                    Volver al catálogo
                </a>
            `;

            return;
        }

        mostrarDetalle(producto);

    } catch (error) {

        console.error(
            "Error cargando el producto:",
            error
        );

        contenedorDetalle.innerHTML = `
            <p>No se pudo cargar el producto.</p>
        `;
    }
}

function mostrarDetalle(producto) {

    contenedorDetalle.innerHTML = `
        <article class="detalle-card">

            <h2>${producto.nombre}</h2>

            <p>
                <strong>Código:</strong>
                ${producto.codigo}
            </p>

            <p>
                <strong>Categoría:</strong>
                ${producto.categoria}
            </p>

            <p>
                <strong>Marca:</strong>
                ${producto.marca}
            </p>

            <p>
                <strong>Modelo:</strong>
                ${producto.modelo}
            </p>

            <p>
                ${producto.descripcion}
            </p>

            <p>
                <strong>Stock disponible:</strong>
                ${producto.stock}
            </p>

            <p class="precio">
                $${producto.precio.toLocaleString("es-CL")}
            </p>

            <button onclick="agregarAlCarrito('${producto.codigo}')">
                Agregar al carrito
            </button>

            <br><br>

            <a href="productos.html">
                ← Volver al catálogo
            </a>

        </article>
    `;
}

cargarDetalle();