import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import { obtenerProductos } from '../services/productos.js';

function Home() {
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

  const categorias = useMemo(() => {
    return [
      ...new Set(productos.map((producto) => producto.categoria).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, 'es'));
  }, [productos]);

  const destacados = productos
    .filter((producto) => Number(producto.stock) > 0)
    .slice(0, 3);

  const formatoPrecio = (precio) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);

  return (
    <>
      <Navbar />

      <section className="bg-dark text-light py-5">
        <div className="container py-4 text-center">
          <h1 className="display-5 fw-bold">Bienvenido a Sonido Vivo</h1>
          <p className="lead mb-4" style={{ color: '#e2e8f0' }}>
            Encuentra instrumentos y accesorios para darle vida a tu música.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            <Link to="/productos" className="btn btn-primary btn-lg">
              Ver catálogo
            </Link>
            <Link to="/contacto" className="btn btn-outline-light btn-lg">
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      <main className="container py-5">
        <section className="mb-5">
          <h2 className="fw-bold mb-4">Explora nuestras categorías</h2>

          {cargando ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {categorias.map((categoria) => (
                <div className="col-6 col-md-4 col-lg-3" key={categoria}>
                  <Link
                    to={`/productos?categoria=${encodeURIComponent(categoria)}`}
                    className="card h-100 text-decoration-none shadow-sm"
                  >
                    <div className="card-body d-flex align-items-center justify-content-center text-center">
                      <span className="fw-semibold text-dark">{categoria}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {destacados.length > 0 && (
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Productos destacados</h2>
              <Link to="/productos" className="btn btn-outline-primary btn-sm">
                Ver todos
              </Link>
            </div>

            <div className="row g-4">
              {destacados.map((producto) => (
                <div className="col-sm-6 col-lg-4" key={producto.codigo}>
                  <article className="card h-100 shadow-sm overflow-hidden">
                    {producto.imagen && (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="card-img-top bg-light p-2"
                        style={{ height: '190px', objectFit: 'contain' }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <span className="badge text-bg-secondary align-self-start mb-2">
                        {producto.categoria}
                      </span>
                      <h3 className="h5 card-title">{producto.nombre}</h3>
                      <p className="text-secondary mb-2">
                        {producto.marca} · {producto.modelo}
                      </p>
                      <p className="h5 fw-bold mt-auto">
                        {formatoPrecio(producto.precio)}
                      </p>
                      <Link
                        to={`/productos/${encodeURIComponent(String(producto.codigo))}`}
                        className="btn btn-outline-primary mt-2"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="row g-4">
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold">¿Ya encontraste lo que buscas?</h2>
                <p className="text-secondary">
                  Revisa los productos que has agregado a tu carrito.
                </p>
                <Link to="/carrito" className="btn btn-primary">
                  Ver carrito
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h4 fw-bold">Consejos para músicos</h2>
                <p className="text-secondary">
                  Lee nuestras guías de compra y arma tu equipo ideal.
                </p>
                <Link to="/blogs" className="btn btn-outline-primary">
                  Ir al blog
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Home;