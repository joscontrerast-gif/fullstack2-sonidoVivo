const contenedorProductos = document.getElementById("productos-container");
const buscador = document.getElementById("buscador");
const filtroCategoria = document.getElementById("filtro-categoria");

let productos = [];

async function cargarProductos() {
    try {

        productos = await obtenerProductos();

        mostrarProductos(productos);

    } catch (error) {

        console.error("Error cargando productos:", error);

        contenedorProductos.innerHTML = `
            <p>No se pudieron cargar los productos.</p>
        `;
    }
}

function mostrarProductos(listaProductos) {
    contenedorProductos.innerHTML = "";

    if (listaProductos.length === 0) {
        contenedorProductos.innerHTML = `
            <p>No se encontraron productos.</p>
        `;
        return;
    }

    listaProductos.forEach(producto => {
        const tarjeta = document.createElement("article");

        tarjeta.classList.add("producto-card");

        tarjeta.innerHTML = `
            <h3>${producto.nombre}</h3>

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

            <p>${producto.descripcion}</p>

            <p>
                <strong>Stock:</strong>
                ${producto.stock}
            </p>

            <p class="precio">
                $${producto.precio.toLocaleString("es-CL")}
            </p>

            <button onclick="verProducto('${producto.codigo}')">
                Ver producto
            </button>
        `;

        contenedorProductos.appendChild(tarjeta);
    });
}

function filtrarProductos() {

    const texto = buscador.value.toLowerCase();
    const categoria = filtroCategoria.value;

    const resultados = productos.filter(producto => {

        const coincideTexto =
            producto.nombre.toLowerCase().includes(texto) ||
            producto.marca.toLowerCase().includes(texto) ||
            producto.modelo.toLowerCase().includes(texto);

        const coincideCategoria =
            categoria === "" ||
            producto.categoria === categoria;

        return coincideTexto && coincideCategoria;
    });

    mostrarProductos(resultados);
}

buscador.addEventListener("input", filtrarProductos);

filtroCategoria.addEventListener("change", filtrarProductos);

function verProducto(codigo) {
    window.location.href =
        `producto-detalle.html?codigo=${codigo}`;
}

cargarProductos();