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
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    async function cargarProductos() {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch {
        setError('No se pudieron cargar los productos del catálogo.');
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, []);

  const formatoPrecio = (precio) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);

  const productosCarrito = carrito
    .map((item) => {
      const producto = productos.find(
        (p) => String(p.codigo) === String(item.codigo)
      );

      if (!producto) {
        return null;
      }

      return {
        ...producto,
        cantidad: Number(item.cantidad) || 1,
      };
    })
    .filter(Boolean);

  const subtotal = productosCarrito.reduce(
    (suma, producto) =>
      suma + Number(producto.precio) * producto.cantidad,
    0
  );

  function manejarCambioCantidad(producto, nuevaCantidad) {
    const resultado = cambiarCantidad(
      producto.codigo,
      nuevaCantidad,
      Number(producto.stock)
    );

    if (!resultado.exito) {
      setMensaje(resultado.mensaje);
      return;
    }

    setCarrito(resultado.carrito);
    setMensaje('');
  }

  function manejarEliminar(codigo) {
    const nuevoCarrito = eliminarDelCarrito(codigo);

    setCarrito(nuevoCarrito);
    setMensaje('Producto eliminado del carrito.');
  }

  function manejarVaciarCarrito() {
    vaciarCarrito();
    setCarrito([]);
    setMensaje('El carrito se ha vaciado.');
  }

  if (cargando) {
    return (
      <main className="container py-5">
        <p>Cargando carrito...</p>
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
        <h1 className="fw-bold mb-4">Mi carrito</h1>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="alert alert-info" role="status">
            {mensaje}
          </div>
        )}

        {!error && productosCarrito.length === 0 && (
          <section className="text-center py-5">
            <h2 className="h4">Tu carrito está vacío</h2>
            <p className="text-secondary">
              Explora nuestro catálogo y agrega productos para comenzar.
            </p>

            <Link to="/" className="btn btn-primary mt-2">
              Ir al catálogo
            </Link>
          </section>
        )}

        {!error && productosCarrito.length > 0 && (
          <div className="row g-4">
            <section className="col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  {productosCarrito.map((producto) => {
                    const sinStock = Number(producto.stock) <= 0;
                    const stockSuperado =
                      producto.cantidad > Number(producto.stock);

                    return (
                      <article
                        key={producto.codigo}
                        className="border-bottom py-3"
                      >
                        <div className="row align-items-center g-3">
                          <div className="col">
                            <h2 className="h5 mb-1">
                              {producto.nombre}
                            </h2>

                            <p className="text-secondary small mb-1">
                              {producto.marca} · {producto.modelo}
                            </p>

                            <p className="mb-1">
                              Precio unitario:{' '}
                              <strong>
                                {formatoPrecio(producto.precio)}
                              </strong>
                            </p>

                            <p className="small text-secondary mb-2">
                              Stock disponible: {producto.stock}
                            </p>

                            {stockSuperado && (
                              <p className="text-danger small">
                                La cantidad supera el stock disponible.
                                Ajusta la cantidad para continuar.
                              </p>
                            )}

                            {sinStock && (
                              <p className="text-danger small">
                                Este producto está sin stock.
                              </p>
                            )}

                            <div className="d-flex flex-wrap align-items-center gap-2">
                              <label
                                htmlFor={`cantidad-${producto.codigo}`}
                                className="form-label mb-0"
                              >
                                Cantidad:
                              </label>

                              <input
                                id={`cantidad-${producto.codigo}`}
                                type="number"
                                className="form-control"
                                style={{ width: '90px' }}
                                min="1"
                                max={Number(producto.stock)}
                                value={producto.cantidad}
                                disabled={sinStock}
                                onChange={(evento) => {
                                  const valor = evento.target.value;

                                  if (valor === '') {
                                    return;
                                  }

                                  manejarCambioCantidad(
                                    producto,
                                    Number(valor)
                                  );
                                }}
                              />

                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() =>
                                  manejarEliminar(producto.codigo)
                                }
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>

                          <div className="col-auto text-end">
                            <span className="text-secondary small">
                              Subtotal
                            </span>

                            <p className="h5 fw-bold mb-0">
                              {formatoPrecio(
                                Number(producto.precio) *
                                  producto.cantidad
                              )}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  <div className="d-flex justify-content-between flex-wrap gap-2 mt-4">
                    <Link
                      to="/"
                      className="btn btn-outline-secondary"
                    >
                      Seguir comprando
                    </Link>

                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={manejarVaciarCarrito}
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h4 mb-3">Resumen del pedido</h2>

                  <p className="d-flex justify-content-between">
                    <span>Productos</span>
                    <strong>
                      {productosCarrito.reduce(
                        (suma, producto) => suma + producto.cantidad,
                        0
                      )}
                    </strong>
                  </p>

                  <p className="d-flex justify-content-between">
                    <span>Subtotal</span>
                    <strong>{formatoPrecio(subtotal)}</strong>
                  </p>

                  <p className="small text-secondary">
                    El costo de entrega se calculará en el siguiente paso.
                  </p>

                  <hr />

                  <p className="d-flex justify-content-between h5">
                    <span>Total parcial</span>
                    <strong>{formatoPrecio(subtotal)}</strong>
                  </p>

                  {productosCarrito.some(
                    (producto) =>
                      Number(producto.stock) <= 0 ||
                      producto.cantidad > Number(producto.stock)
                  ) && (
                    <div className="alert alert-warning small">
                      Revisa las cantidades y el stock antes de continuar.
                    </div>
                  )}

                  <Link
                    to="/checkout"
                    className={`btn btn-primary w-100 ${
                      productosCarrito.some(
                        (producto) =>
                          Number(producto.stock) <= 0 ||
                          producto.cantidad > Number(producto.stock)
                      )
                        ? 'disabled'
                        : ''
                    }`}
                    aria-disabled={productosCarrito.some(
                      (producto) =>
                        Number(producto.stock) <= 0 ||
                        producto.cantidad > Number(producto.stock)
                    )}
                    onClick={(evento) => {
                      const hayProblemas = productosCarrito.some(
                        (producto) =>
                          Number(producto.stock) <= 0 ||
                          producto.cantidad > Number(producto.stock)
                      );

                      if (hayProblemas) {
                        evento.preventDefault();
                        setMensaje(
                          'Corrige las cantidades según el stock disponible.'
                        );
                      }
                    }}
                  >
                    Continuar compra
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default Carrito;