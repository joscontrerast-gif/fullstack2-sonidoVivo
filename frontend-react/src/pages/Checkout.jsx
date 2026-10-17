
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerProductos } from '../services/productos.js';
import {
  obtenerCarrito,
  vaciarCarrito,
} from '../services/carrito.js';

function Checkout() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [compra, setCompra] = useState(null);

  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [entrega, setEntrega] = useState('estandar');

  const carrito = obtenerCarrito();

  useEffect(() => {
    async function cargarProductos() {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch {
        setError('No se pudieron cargar los productos.');
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

  const productosCompra = carrito
    .map((item) => {
      const producto = productos.find(
        (p) => String(p.codigo) === String(item.codigo)
      );

      return producto
        ? { ...producto, cantidad: Number(item.cantidad) || 1 }
        : null;
    })
    .filter(Boolean);

  const subtotal = productosCompra.reduce(
    (suma, producto) =>
      suma + Number(producto.precio) * producto.cantidad,
    0
  );

  const costoEntrega = entrega === 'express' ? 4990 : 1990;
  const total = subtotal + costoEntrega;

  function confirmarCompra(evento) {
    evento.preventDefault();
    setError('');

    if (productosCompra.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    const productoSinStock = productosCompra.find(
      (producto) =>
        producto.cantidad < 1 ||
        producto.cantidad > Number(producto.stock)
    );

    if (productoSinStock) {
      setError(
        `La cantidad de ${productoSinStock.nombre} supera el stock disponible.`
      );
      return;
    }

    const resumen = {
      productos: productosCompra.map((producto) => ({
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        cantidad: producto.cantidad,
        subtotal: Number(producto.precio) * producto.cantidad,
      })),
      direccion,
      comuna,
      entrega:
        entrega === 'express'
          ? 'Entrega express'
          : 'Entrega estándar',
      costoEntrega,
      total,
      fecha: new Date().toLocaleString('es-CL'),
    };

    vaciarCarrito();
    setCompra(resumen);
  }

  if (cargando) {
    return <main className="container py-5">Cargando checkout...</main>;
  }

  if (compra) {
    return (
      <main className="container py-5">
        <div className="alert alert-success">
          <h1 className="h3">¡Compra confirmada!</h1>
          <p className="mb-0">
            La compra se ha registrado como una simulación.
          </p>
        </div>

        <section className="card">
          <div className="card-body">
            <h2 className="h4">Resumen de compra</h2>

            <p><strong>Fecha:</strong> {compra.fecha}</p>
            <p><strong>Dirección:</strong> {compra.direccion}</p>
            <p><strong>Comuna:</strong> {compra.comuna}</p>
            <p><strong>Entrega:</strong> {compra.entrega}</p>

            <hr />

            {compra.productos.map((producto) => (
              <div
                key={producto.codigo}
                className="d-flex justify-content-between gap-3 mb-2"
              >
                <span>
                  {producto.nombre} × {producto.cantidad}
                </span>
                <strong>{formatoPrecio(producto.subtotal)}</strong>
              </div>
            ))}

            <hr />

            <p className="d-flex justify-content-between">
              <span>Envío</span>
              <strong>{formatoPrecio(compra.costoEntrega)}</strong>
            </p>

            <p className="h4 text-end">
              Total: {formatoPrecio(compra.total)}
            </p>

            <Link to="/" className="btn btn-primary mt-3">
              Volver a la tienda
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (productosCompra.length === 0 && !error) {
    return (
      <main className="container py-5">
        <h1>Finalizar compra</h1>
        <div className="alert alert-info mt-3">
          Tu carrito está vacío.
        </div>
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
          <Link to="/carrito" className="btn btn-outline-light">
            Volver al carrito
          </Link>
        </div>
      </nav>

      <main className="container py-4">
        <h1 className="mb-4">Finalizar compra</h1>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row g-4">
          <section className="col-lg-7">
            <div className="card">
              <div className="card-body">
                <h2 className="h4 mb-3">Datos de entrega</h2>

                <form onSubmit={confirmarCompra}>
                  <div className="mb-3">
                    <label htmlFor="direccion" className="form-label">
                      Dirección de envío
                    </label>
                    <input
                      id="direccion"
                      className="form-control"
                      value={direccion}
                      onChange={(evento) =>
                        setDireccion(evento.target.value)
                      }
                      placeholder="Calle, número y departamento"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="comuna" className="form-label">
                      Comuna
                    </label>
                    <input
                      id="comuna"
                      className="form-control"
                      value={comuna}
                      onChange={(evento) =>
                        setComuna(evento.target.value)
                      }
                      placeholder="Ingresa tu comuna"
                      required
                    />
                  </div>

                  <fieldset className="mb-4">
                    <legend className="form-label">
                      Método de entrega
                    </legend>

                    <div className="form-check mb-2">
                      <input
                        id="estandar"
                        className="form-check-input"
                        type="radio"
                        name="entrega"
                        value="estandar"
                        checked={entrega === 'estandar'}
                        onChange={(evento) =>
                          setEntrega(evento.target.value)
                        }
                      />
                      <label
                        htmlFor="estandar"
                        className="form-check-label"
                      >
                        Estándar — {formatoPrecio(1990)}
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        id="express"
                        className="form-check-input"
                        type="radio"
                        name="entrega"
                        value="express"
                        checked={entrega === 'express'}
                        onChange={(evento) =>
                          setEntrega(evento.target.value)
                        }
                      />
                      <label
                        htmlFor="express"
                        className="form-check-label"
                      >
                        Express — {formatoPrecio(4990)}
                      </label>
                    </div>
                  </fieldset>

                  <button type="submit" className="btn btn-primary">
                    Confirmar compra
                  </button>
                </form>
              </div>
            </div>
          </section>

          <aside className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <h2 className="h4">Resumen del pedido</h2>

                {productosCompra.map((producto) => (
                  <div
                    key={producto.codigo}
                    className="d-flex justify-content-between gap-3 mb-3"
                  >
                    <span>
                      {producto.nombre} × {producto.cantidad}
                    </span>
                    <strong>
                      {formatoPrecio(
                        Number(producto.precio) * producto.cantidad
                      )}
                    </strong>
                  </div>
                ))}

                <hr />

                <p className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <strong>{formatoPrecio(subtotal)}</strong>
                </p>

                <p className="d-flex justify-content-between">
                  <span>Envío</span>
                  <strong>{formatoPrecio(costoEntrega)}</strong>
                </p>

                <hr />

                <p className="h4 d-flex justify-content-between">
                  <span>Total</span>
                  <span>{formatoPrecio(total)}</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

export default Checkout;
