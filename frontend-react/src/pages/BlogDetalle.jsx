import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { blogs } from '../data/blogs.js';
import { obtenerProductos } from '../services/productos.js';
import { agregarAlCarritoApi } from '../services/carrito.js';

function ProductoMencionado({ producto }) {
  const [mensaje, setMensaje] = useState('');
  const [agregado, setAgregado] = useState(false);
  const sinStock = Number(producto.stock) <= 0;

  const formatoPrecio = (precio) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);

  async function manejarAgregar() {
    const resultado = await agregarAlCarritoApi(producto.codigo, 1, Number(producto.stock));
    setMensaje(resultado.mensaje);
    setAgregado(resultado.exito);
  }

  return (
    <article className="card h-100 shadow-sm overflow-hidden">
      <div className="row g-0 h-100">
        <div className="col-4 bg-light d-flex align-items-center justify-content-center p-2">
          {producto.imagen && (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className="img-fluid"
              style={{ maxHeight: '120px', objectFit: 'contain' }}
            />
          )}
        </div>
        <div className="col-8">
          <div className="card-body d-flex flex-column h-100">
            <span className="badge text-bg-secondary align-self-start mb-2">
              {producto.categoria}
            </span>
            <h3 className="h6 fw-bold mb-1">{producto.nombre}</h3>
            <p className="small text-secondary mb-2">
              {producto.marca} · {producto.modelo}
            </p>
            <p className="fw-bold mb-1">{formatoPrecio(producto.precio)}</p>
            <p className={`small mb-2 ${sinStock ? 'text-danger' : 'text-success'}`}>
              {sinStock ? 'Sin stock' : `Stock disponible: ${producto.stock}`}
            </p>

            {mensaje && (
              <div className={`alert ${agregado ? 'alert-success' : 'alert-warning'} py-1 px-2 small mb-2`}>
                {mensaje}
              </div>
            )}

            <div className="d-flex flex-wrap gap-2 mt-auto">
              <Link
                to={`/productos/${encodeURIComponent(String(producto.codigo))}`}
                className="btn btn-outline-primary btn-sm"
              >
                Ver detalle
              </Link>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={sinStock}
                onClick={manejarAgregar}
              >
                {sinStock ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function BlogDetalle() {
  const { id } = useParams();
  const blog = blogs.find((item) => String(item.id) === id);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch {
        setProductos([]);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  if (!blog) {
    return (
      <>
        <Navbar />
        <main className="container py-5">
          <div className="alert alert-warning">El artículo no existe.</div>
          <Link to="/blogs" className="btn btn-secondary">
            Volver
          </Link>
        </main>
      </>
    );
  }

  const mencionados = productos.filter((producto) =>
    (blog.productos || []).includes(String(producto.codigo))
  );

  return (
    <>
      <Navbar />
      <main className="container py-5">
        <div className="row justify-content-center">
          <article className="col-lg-8">
            <h1 className="fw-bold mb-4">{blog.titulo}</h1>
            <p className="lead">{blog.introduccion}</p>
            {blog.secciones.map((seccion) => (
              <section className="mb-4" key={seccion.titulo}>
                <h2 className="h5 fw-bold">{seccion.titulo}</h2>
                <p>{seccion.texto}</p>
              </section>
            ))}
          </article>
        </div>

        <section className="mt-4 pt-4 border-top">
          <h2 className="h4 fw-bold mb-4">Productos mencionados en este artículo</h2>

          {cargando ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : mencionados.length === 0 ? (
            <div className="alert alert-info">
              No se pudieron cargar los productos de este artículo.
            </div>
          ) : (
            <div className="row g-4">
              {mencionados.map((producto) => (
                <div className="col-md-6" key={producto.codigo}>
                  <ProductoMencionado producto={producto} />
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="text-center mt-5">
          <Link to="/blogs" className="btn btn-outline-secondary">
            Volver a los blogs
          </Link>
        </div>
      </main>
    </>
  );
}

export default BlogDetalle;