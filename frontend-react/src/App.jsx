
import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { obtenerProductos } from './services/productos.js';

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
    return [...new Set(productos.map((producto) => producto.categoria))]
      .sort((a, b) => a.localeCompare(b, 'es'));
  }, [productos]);

  const productosFiltrados = productos.filter((producto) => {
    const termino = busqueda.trim().toLowerCase();

    const coincideBusqueda = [
      producto.nombre,
      producto.marca,
      producto.modelo,
      producto.codigo,
    ].some((dato) => dato?.toLowerCase().includes(termino));

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
    }).format(precio);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            Sonido Vivo
          </a>

          <span className="navbar-text">
            Instrumentos y equipos musicales
          </span>
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
          <p className="text-center py-5">Cargando productos...</p>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}. Comprueba que exista public/data/productos.json.
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
                  <div className="col-sm-6 col-lg-4" key={producto.codigo}>
                    <article className="card h-100 shadow-sm">
                      <div className="card-body d-flex flex-column">
                        <span className="badge text-bg-secondary align-self-start mb-2">
                          {producto.categoria}
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
                            {producto.stock > 0
                              ? `Stock disponible: ${producto.stock}`
                              : 'Sin stock'}
                          </p>
                        </div>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
