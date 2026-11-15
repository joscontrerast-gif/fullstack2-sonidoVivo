import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerToken } from '../services/api.js';
import {
  obtenerProductoPorCodigo,
  obtenerProductos,
} from '../services/productos.js';
import { agregarAlCarritoApi } from '../services/carrito.js';
import Navbar from '../components/Navbar.jsx';

function DetalleProducto() {
  const { codigo } = useParams();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    async function cargarProducto() {
      setCargando(true);
      setError('');
      setProducto(null);
      setMensaje('');
      setAgregado(false);

      try {
        if (!obtenerToken()) {
          const lista = await obtenerProductos();
          const encontrado = Array.isArray(lista)
            ? lista.find((p) => String(p.codigo) === String(codigo))
            : null;
          setProducto(encontrado ?? null);
        } else {
          const encontrado = await obtenerProductoPorCodigo(codigo);
          setProducto(encontrado ?? null);
        }
      } catch (err) {
        if (err.status === 404) {
          setProducto(null);
        } else {
          setError('No se pudo cargar el producto.');
        }
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

  async function manejarAgregarAlCarrito() {
    if (!producto || Number(producto.stock) <= 0) {
      setMensaje('Este producto no tiene stock disponible.');
      setAgregado(false);
      return;
    }

    const resultado = await agregarAlCarritoApi(
      producto.codigo,
      1,
      Number(producto.stock)
    );

    setMensaje(resultado.mensaje);
    setAgregado(resultado.exito);
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
      <Navbar />

      <main className="container py-5">
        <Link to="/" className="btn btn-outline-secondary mb-4">
          ← Volver al catálogo
        </Link>

        <article className="card shadow-sm">
          <div className="card-body p-4">
            <div className="row g-4 align-items-center">
              {producto.imagen && (
                <div className="col-md-5 text-center">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="img-fluid rounded bg-light p-3"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              )}

              <div className={producto.imagen ? 'col-md-7' : 'col-12'}>
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
                  <div
                    className={`alert ${
                      agregado ? 'alert-success' : 'alert-warning'
                    }`}
                    role="status"
                  >
                    {mensaje}

                    {agregado && (
                      <div className="mt-2">
                        <Link to="/carrito" className="btn btn-success btn-sm">
                          Ver carrito
                        </Link>
                      </div>
                    )}
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
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

export default DetalleProducto;