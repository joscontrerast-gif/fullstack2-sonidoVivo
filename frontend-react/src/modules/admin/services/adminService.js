import { URLS, apiFetch, obtenerToken } from '../../../services/api.js';
import {
  obtenerProductos as obtenerProductosLocal,
  crearProducto as crearProductoLocal,
  actualizarProducto as actualizarProductoLocal,
  eliminarProducto as eliminarProductoLocal,
  normalizarCodigo,
  codigoDe,
} from '../../../data/productos.js';

export const CATEGORIAS_BASE = [
  'Accesorios',
  'Amplificadores',
  'Bajos Eléctricos',
  'Baterías',
  'Estudio y Grabación',
  'Guitarras Acústicas',
  'Guitarras Eléctricas',
  'Micrófonos',
  'Pedales de Efectos',
  'Teclados y Pianos',
];

export const LIMITES = {
  codigoMin: 3,
  codigoMax: 20,
  nombre: 100,
  marca: 50,
  modelo: 50,
  descripcion: 500,
  imagen: 500,
};

const PATRON_CODIGO = /^[A-Z0-9-]+$/;

function texto(valor) {
  return String(valor ?? '').trim();
}

function aNumero(valor) {
  if (typeof valor === 'number') {
    return valor;
  }
  const limpio = texto(valor);
  return limpio === '' ? NaN : Number(limpio);
}

function esEnteroNoNegativo(numero) {
  return Number.isInteger(numero) && numero >= 0;
}

export function validarProducto(
  datos = {},
  { modo = 'crear', productosExistentes = [] } = {}
) {
  const errores = {};

  const codigo = normalizarCodigo(datos.codigo);
  const nombre = texto(datos.nombre);
  const marca = texto(datos.marca);
  const modelo = texto(datos.modelo);
  const descripcion = texto(datos.descripcion);
  const imagen = texto(datos.imagen);
  const categoria = texto(datos.categoria);
  const precio = aNumero(datos.precio);
  const stock = aNumero(datos.stock);
  const stockCriticoBruto = texto(datos.stockCritico);
  const stockCritico =
    stockCriticoBruto === '' ? null : aNumero(datos.stockCritico);

  if (modo === 'crear') {
    if (codigo.length < LIMITES.codigoMin) {
      errores.codigo = `El código debe tener al menos ${LIMITES.codigoMin} caracteres.`;
    } else if (codigo.length > LIMITES.codigoMax) {
      errores.codigo = `El código no puede superar los ${LIMITES.codigoMax} caracteres.`;
    } else if (!PATRON_CODIGO.test(codigo)) {
      errores.codigo =
        'El código solo puede contener letras, números y guiones.';
    } else if (
      productosExistentes.some(
        (producto) => normalizarCodigo(codigoDe(producto)) === codigo
      )
    ) {
      errores.codigo = `Ya existe un producto con el código "${codigo}".`;
    }
  }

  if (!nombre) {
    errores.nombre = 'El nombre es obligatorio.';
  } else if (nombre.length > LIMITES.nombre) {
    errores.nombre = `El nombre no puede superar los ${LIMITES.nombre} caracteres.`;
  }

  if (marca.length > LIMITES.marca) {
    errores.marca = `La marca no puede superar los ${LIMITES.marca} caracteres.`;
  }

  if (modelo.length > LIMITES.modelo) {
    errores.modelo = `El modelo no puede superar los ${LIMITES.modelo} caracteres.`;
  }

  if (descripcion.length > LIMITES.descripcion) {
    errores.descripcion = `La descripción no puede superar los ${LIMITES.descripcion} caracteres.`;
  }

  if (imagen.length > LIMITES.imagen) {
    errores.imagen = `La ruta o URL de imagen no puede superar los ${LIMITES.imagen} caracteres.`;
  }

  if (!categoria) {
    errores.categoria = 'Debes seleccionar una categoría.';
  }

  if (!Number.isFinite(precio) || precio < 0) {
    errores.precio = 'El precio es obligatorio y debe ser mayor o igual a 0.';
  }

  if (!esEnteroNoNegativo(stock)) {
    errores.stock =
      'El stock es obligatorio y debe ser un número entero mayor o igual a 0.';
  }

  if (stockCritico !== null && !esEnteroNoNegativo(stockCritico)) {
    errores.stockCritico =
      'El stock crítico debe ser un número entero mayor o igual a 0.';
  }

  const valido = Object.keys(errores).length === 0;

  return {
    valido,
    errores,
    producto: valido
      ? {
          codigo,
          nombre,
          marca,
          modelo,
          descripcion,
          imagen,
          categoria,
          precio,
          stock,
          stockCritico,
        }
      : null,
  };
}

// ---- Operaciones CRUD (Oracle con sesión / localStorage en tests) ----

export async function listarProductos() {
  if (!obtenerToken()) {
    return await obtenerProductosLocal();
  }
  return await apiFetch(URLS.admin, '/api/admin/productos?todos=true');
}

export async function guardarProducto(datos, codigoOriginal = null) {
  const modo = codigoOriginal ? 'editar' : 'crear';
  const existentes = await listarProductos();
  const datosFinales =
    modo === 'editar' ? { ...datos, codigo: codigoOriginal } : datos;

  const resultado = validarProducto(datosFinales, {
    modo,
    productosExistentes: existentes,
  });

  if (!resultado.valido) {
    return { ok: false, errores: resultado.errores, producto: null };
  }

  if (!obtenerToken()) {
    const producto =
      modo === 'editar'
        ? await actualizarProductoLocal(codigoOriginal, resultado.producto)
        : await crearProductoLocal(resultado.producto);
    return { ok: true, errores: {}, producto };
  }

  const producto =
    modo === 'editar'
      ? await apiFetch(
          URLS.admin,
          `/api/admin/productos/${encodeURIComponent(codigoOriginal)}`,
          {
            method: 'PUT',
            body: JSON.stringify(resultado.producto),
          }
        )
      : await apiFetch(URLS.admin, '/api/admin/productos', {
          method: 'POST',
          body: JSON.stringify(resultado.producto),
        });

  return { ok: true, errores: {}, producto };
}

export async function borrarProducto(codigo) {
  if (!obtenerToken()) {
    return await eliminarProductoLocal(codigo);
  }
  return await apiFetch(
    URLS.admin,
    `/api/admin/productos/${encodeURIComponent(codigo)}`,
    { method: 'DELETE' }
  );
}

// ---- Helpers de presentación y consulta ----

export function esStockCritico(producto) {
  if (producto.stockCritico === null || producto.stockCritico === undefined) {
    return false;
  }
  return Number(producto.stock) <= Number(producto.stockCritico);
}

export function formatearPrecio(valor) {
  const numero = Number(valor) || 0;
  if (numero === 0) {
    return 'FREE';
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(numero);
}

export function obtenerCategorias(productos) {
  return [
    ...new Set(productos.map((producto) => producto.categoria).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'es'));
}

export function obtenerCategoriasFormulario(productos) {
  return [
    ...new Set([...CATEGORIAS_BASE, ...obtenerCategorias(productos)]),
  ].sort((a, b) => a.localeCompare(b, 'es'));
}

export function filtrarProductos(
  productos,
  { categoria = 'todos', busqueda = '' } = {}
) {
  const termino = busqueda.trim().toLowerCase();

  return productos.filter((producto) => {
    const coincideCategoria =
      categoria === 'todos' || producto.categoria === categoria;

    const coincideBusqueda =
      termino === '' ||
      [codigoDe(producto), producto.nombre, producto.marca, producto.modelo].some(
        (dato) => String(dato ?? '').toLowerCase().includes(termino)
      );

    return coincideCategoria && coincideBusqueda;
  });
}

export function calcularResumen(productos) {
  return {
    total: productos.length,
    criticos: productos.filter(esStockCritico).length,
    sinStock: productos.filter((producto) => Number(producto.stock) === 0)
      .length,
  };
}