
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerProductos } from '../services/productos.js';
import {
  obtenerCarrito,
  cambiarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
} from '../services/carrito.js';

function Carrito() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState(() => obtenerCarrito());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarProductos() {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch {
        setError('No se pudieron cargar los productos del carrito.');
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, []);

  const productosCarrito = carrito
    .map((item) => {
      const producto = productos.find(
        (p) => String(p.codigo) === String(item.codigo)
      );

      return producto ? { ...producto, cantidad: item.cantidad } : null;
    })
    .filter(Boolean);

  const formatoPrecio = (precio) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);

  const total = productosCarrito.reduce(
    (suma, producto) =>
      suma + Number(producto.precio) * producto.cantidad,
    0
  );

  function actualizarCantidad(codigo, cantidad) {
    const nuevoCarrito = cambiarCantidad(codigo, cantidad);
    setCarrito(nuevoCarrito);
  }

  function quitarProducto(codigo) {
    const nuevoCarrito = eliminarDelCarrito(codigo);
    setCarrito(nuevoCarrito);
  }

  function limpiarCarrito() {
    vaciarCarrito();
    setCarrito([]);
  }

  if (cargando) {
    return <main className="container py-5">Cargando carrito...</main>;
  }

  if (error) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold">
            Sonido Vivo
          </Link>

          <Link to="/" className="btn btn-outline-light">
            Seguir comprando
          </Link>
        </div>
      </nav>

      <main className="container py-4">
        <h1 className="mb-4">Mi carrito</h1>

        {productosCarrito.length === 0 ? (
          <div className="alert alert-info">
            Tu carrito está vacío.
            <div className="mt-3">
              <Link to="/" className="btn btn-primary">
                Ver productos
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-end mb-3">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={limpiarCarrito}
              >
                Vaciar carrito
              </button>
            </div>

            <div className="row g-3">
              {productosCarrito.map((producto) => (
                <div className="col-12" key={producto.codigo}>
                  <article className="card">
                    <div className="card-body">
                      <div className="row align-items-center g-3">
                        <div className="col-md-5">
                          <h2 className="h5">{producto.nombre}</h2>
                          <p className="text-secondary mb-0">
                            {producto.marca} · {producto.modelo}
                          </p>
                        </div>

                        <div className="col-md-2">
                          <span className="text-secondary">
                            Precio unitario
                          </span>
                          <p className="fw-bold mb-0">
                            {formatoPrecio(producto.precio)}
                          </p>
                        </div>

                        <div className="col-md-2">
                          <label
                            className="form-label"
                            htmlFor={`cantidad-${producto.codigo}`}
                          >
                            Cantidad
                          </label>
                          <input
                            id={`cantidad-${producto.codigo}`}
                            type="number"
                            min="1"
                            max={producto.stock}
                            className="form-control"
                            value={producto.cantidad}
                            onChange={(evento) =>
                              actualizarCantidad(
                                producto.codigo,
                                Math.min(
                                  Number(producto.stock) || 1,
                                  Math.max(1, Number(evento.target.value) || 1)
                                )
                              )
                            }
                          />
                          <small className="text-secondary">
                            Stock: {producto.stock}
                          </small>
                        </div>

                        <div className="col-md-2">
                          <span className="text-secondary">Subtotal</span>
                          <p className="fw-bold mb-0">
                            {formatoPrecio(
                              Number(producto.precio) * producto.cantidad
                            )}
                          </p>
                        </div>

                        <div className="col-md-1">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => quitarProducto(producto.codigo)}
                            aria-label={`Eliminar ${producto.nombre}`}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>

            <div className="card mt-4">
              <div className="card-body text-end">
                <p className="text-secondary mb-1">
                  Total de la compra
                </p>
                <p className="h3 fw-bold">{formatoPrecio(total)}</p>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    alert('En el siguiente paso implementaremos la confirmación de compra.')
                  }
                >
                  Continuar compra
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default Carrito;
