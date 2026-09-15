const CLAVE_PRODUCTOS = "productosSonidoVivo";


// Obtener productos
async function obtenerProductos() {

    const productosGuardados =
        localStorage.getItem(CLAVE_PRODUCTOS);

    if (productosGuardados) {

        return JSON.parse(productosGuardados);
    }


    const respuesta =
        await fetch("data/productos.json");

    if (!respuesta.ok) {

        throw new Error("No se pudo cargar productos.json");
    }


    const productos =
        await respuesta.json();


    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productos)
    );


    return productos;
}


// Guardar productos
function guardarProductos(productos) {

    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productos)
    );
}