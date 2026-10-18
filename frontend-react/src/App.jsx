
import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { obtenerProductos } from './services/productos.js';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Carrito from './pages/Carrito.jsx';
import Checkout from './pages/Checkout.jsx';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch (error) {
        setError(error.message);
      } finally {
        setCargando(false);
      }
    }

    cargarCatalogo();
  }, []);

  const categorias = useMemo(() => {
    return [
      ...new Set(
        productos
          .map((producto) => producto.categoria)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, 'es'));
  }, [productos]);

  const productosFiltrados = productos.filter((producto) => {
    const termino = busqueda.trim().toLowerCase();

    const coincideBusqueda = [
      producto.nombre,
      producto.marca,
      producto.modelo,
      producto.codigo,
    ].some((dato) =>
      String(dato ?? '').toLowerCase().includes(termino)
    );

    const coincideCategoria =
      !categoriaSeleccionada ||
      producto.categoria === categoriaSeleccionada;

    return coincideBusqueda && coincideCategoria;
  });

  const formatoPrecio = (precio) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(Number(precio) || 0);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            Sonido Vivo
          </Link>

          <div className="d-flex align-items-center gap-3">
            <span className="navbar-text d-none d-sm-inline">
              Instrumentos y equipos musicales
            </span>

            <Link to="/carrito" className="btn btn-outline-light">
              🛒 Carrito
            </Link>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <div className="mb-4">
          <h1 className="fw-bold">Catálogo de productos</h1>
          <p className="text-secondary">
            Encuentra el equipo ideal para tu sonido.
          </p>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-7">
            <label htmlFor="buscador" className="form-label">
              Buscar productos
            </label>

            <input
              id="buscador"
              type="search"
              className="form-control"
              placeholder="Nombre, marca, modelo o código..."
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>

          <div className="col-md-5">
            <label htmlFor="categoria" className="form-label">
              Filtrar por categoría
            </label>

            <select
              id="categoria"
              className="form-select"
              value={categoriaSeleccionada}
              onChange={(evento) =>
                setCategoriaSeleccionada(evento.target.value)
              }
            >
              <option value="">Todas las categorías</option>

              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
        </div>

        {cargando && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            No se pudieron cargar los productos: {error}
            <p className="mb-0 mt-2">
              Comprueba que exista public/data/productos.json.
            </p>
          </div>
        )}

        {!cargando && !error && (
          <>
            <p className="text-secondary">
              Productos encontrados: {productosFiltrados.length}
            </p>

            {productosFiltrados.length === 0 ? (
              <div className="alert alert-info">
                No se encontraron productos con esos criterios.
              </div>
            ) : (
              <div className="row g-4">
                {productosFiltrados.map((producto) => (
                  <div
                    className="col-sm-6 col-lg-4"
                    key={producto.codigo}
                  >
                    <article className="card h-100 shadow-sm">
                      <div className="card-body d-flex flex-column">
                        <span className="badge text-bg-secondary align-self-start mb-2">
                          {producto.categoria || 'Sin categoría'}
                        </span>

                        <h2 className="h5 card-title">
                          {producto.nombre}
                        </h2>

                        <p className="text-secondary mb-2">
                          {producto.marca} · {producto.modelo}
                        </p>

                        <p className="card-text">
                          {producto.descripcion}
                        </p>

                        <p className="small text-secondary">
                          Código: {producto.codigo}
                        </p>

                        <div className="mt-auto">
                          <p className="h5 fw-bold">
                            {formatoPrecio(producto.precio)}
                          </p>

                          <p className="small">
                            {Number(producto.stock) > 0
                              ? `Stock disponible: ${producto.stock}`
                              : 'Sin stock'}
                          </p>
                        </div>

                        <Link
                          to={`/productos/${encodeURIComponent(
                            String(producto.codigo)
                          )}`}
                          className="btn btn-outline-primary mt-2"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalogo />} />
      <Route
        path="/productos/:codigo"
        element={<DetalleProducto />}
      />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}

export default App;
