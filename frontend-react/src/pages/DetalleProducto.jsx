
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerProductos } from '../services/productos.js';
import { agregarAlCarrito } from '../services/carrito.js';

function DetalleProducto() {
  const { codigo } = useParams();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    async function cargarProducto() {
      try {
        const productos = await obtenerProductos();

        const encontrado = productos.find(
          (item) => String(item.codigo) === String(codigo)
        );

        setProducto(encontrado ?? null);
      } catch {
        setError('No se pudo cargar el producto.');
      } finally {
        setCargando(false);
      }
    }

    cargarProducto();
  }, [codigo]);

  const formatoPrecio = (precio) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);

  function manejarAgregarAlCarrito() {
    if (!producto || Number(producto.stock) <= 0) {
      return;
    }

    agregarAlCarrito(producto.codigo);
    setMensaje('¡Producto agregado al carrito!');
  }

  if (cargando) {
    return (
      <main className="container py-5">
        <p>Cargando producto...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">{error}</div>

        <Link to="/" className="btn btn-secondary">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="container py-5">
        <h1>Producto no encontrado</h1>

        <Link to="/" className="btn btn-primary mt-3">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const sinStock = Number(producto.stock) <= 0;

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold">
            Sonido Vivo
          </Link>

          <Link to="/carrito" className="btn btn-outline-light">
            🛒 Carrito
          </Link>
        </div>
      </nav>

      <main className="container py-5">
        <Link to="/" className="btn btn-outline-secondary mb-4">
          ← Volver al catálogo
        </Link>

        <article className="card shadow-sm">
          <div className="card-body p-4">
            <span className="badge text-bg-secondary mb-3">
              {producto.categoria || 'Sin categoría'}
            </span>

            <h1>{producto.nombre}</h1>

            <p className="text-secondary">
              {producto.marca} · {producto.modelo}
            </p>

            <p>{producto.descripcion}</p>

            <p className="small text-secondary">
              Código: {producto.codigo}
            </p>

            <h2 className="h4 fw-bold">
              {formatoPrecio(producto.precio)}
            </h2>

            <p>
              {sinStock
                ? 'Sin stock disponible'
                : `Stock disponible: ${producto.stock}`}
            </p>

            {mensaje && (
              <div className="alert alert-success" role="status">
                {mensaje}
                <div className="mt-2">
                  <Link to="/carrito" className="btn btn-success btn-sm">
                    Ver carrito
                  </Link>
                </div>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary"
              disabled={sinStock}
              onClick={manejarAgregarAlCarrito}
            >
              {sinStock ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        </article>
      </main>
    </>
  );
}

export default DetalleProducto;
