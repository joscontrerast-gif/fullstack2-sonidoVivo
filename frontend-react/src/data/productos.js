export const CLAVE_PRODUCTOS = 'productosSonidoVivo';
export const URL_PRODUCTOS_INICIALES = '/data/productos.json';


export function codigoDe(producto) {
  return String(producto?.codigo ?? producto?.sku ?? '').trim();
}

export function normalizarCodigo(codigo) {
  return String(codigo ?? '').trim().toUpperCase();
}

export function fechaHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');

  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function leerAlmacenados() {
  try {
    const datos = localStorage.getItem(CLAVE_PRODUCTOS);

    if (!datos) {
      return null;
    }

    const productos = JSON.parse(datos);

    return Array.isArray(productos) ? productos : null;
  } catch {
    return null;
  }
}

export function guardarProductos(productos) {
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
}

function buscarIndice(productos, codigo) {
  const objetivo = normalizarCodigo(codigo);

  return productos.findIndex(
    (producto) => normalizarCodigo(codigoDe(producto)) === objetivo
  );
}

// READ: lista completa
export async function obtenerProductos() {
  const almacenados = leerAlmacenados();

  if (almacenados) {
    return almacenados;
  }

  const respuesta = await fetch(URL_PRODUCTOS_INICIALES);

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los productos');
  }

  const iniciales = await respuesta.json();

  guardarProductos(iniciales);

  return iniciales;
}

// READ: un producto por código (null si no existe)
export async function obtenerProductoPorCodigo(codigo) {
  const productos = await obtenerProductos();
  const indice = buscarIndice(productos, codigo);

  return indice === -1 ? null : productos[indice];
}

// CREATE
export async function crearProducto(producto) {
  const productos = await obtenerProductos();
  const codigo = normalizarCodigo(codigoDe(producto));

  if (!codigo) {
    throw new Error('El producto debe tener un código.');
  }

  if (buscarIndice(productos, codigo) !== -1) {
    throw new Error(`Ya existe un producto con el código "${codigo}".`);
  }

  const nuevo = {
    ...producto,
    codigo,
    fechaIngreso: producto.fechaIngreso || fechaHoy(),
  };

  guardarProductos([...productos, nuevo]);

  return nuevo;
}

// UPDATE: el código y la fecha de ingreso no se modifican
export async function actualizarProducto(codigo, cambios) {
  const productos = await obtenerProductos();
  const indice = buscarIndice(productos, codigo);

  if (indice === -1) {
    throw new Error(
      `No existe un producto con el código "${normalizarCodigo(codigo)}".`
    );
  }

  const permitidos = { ...cambios };
  delete permitidos.codigo;
  delete permitidos.fechaIngreso;

  const actual = productos[indice];
  const actualizado = {
    ...actual,
    ...permitidos,
    codigo: codigoDe(actual),
  };

  const copia = [...productos];
  copia[indice] = actualizado;
  guardarProductos(copia);

  return actualizado;
}

// DELETE
export async function eliminarProducto(codigo) {
  const productos = await obtenerProductos();
  const indice = buscarIndice(productos, codigo);

  if (indice === -1) {
    throw new Error(
      `No existe un producto con el código "${normalizarCodigo(codigo)}".`
    );
  }

  const eliminado = productos[indice];

  guardarProductos(productos.filter((_, posicion) => posicion !== indice));

  return eliminado;
}

// Vuelve al catálogo inicial del JSON 
export function restablecerProductos() {
  localStorage.removeItem(CLAVE_PRODUCTOS);
}
