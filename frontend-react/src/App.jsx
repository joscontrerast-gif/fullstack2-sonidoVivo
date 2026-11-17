import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { obtenerProductos } from './services/productos.js';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import Carrito from './pages/Carrito.jsx';
import Checkout from './pages/Checkout.jsx';
import MisEncargos from './pages/MisEncargos.jsx';
import LayoutAdmin from './modules/admin/components/LayoutAdmin.jsx';
import DashboardAdmin from './modules/admin/pages/DashboardAdmin.jsx';
import PanelAdmin from './modules/admin/pages/PanelAdmin.jsx';
import EncargosAdmin from './modules/admin/pages/EncargosAdmin.jsx';
import PersonasAdmin from './modules/admin/pages/PersonasAdmin.jsx';
import CompraExitosa from './modules/compra/pages/CompraExitosa.jsx';
import CompraFallida from './modules/compra/pages/CompraFallida.jsx';
import Home from './pages/Home.jsx';
import Nosotros from './pages/Nosotros.jsx';
import Blogs from './pages/Blogs.jsx';
import BlogDetalle from './pages/BlogDetalle.jsx';
import Contacto from './pages/Contacto.jsx';

// 1. Solo entran usuarios autenticados con rol ADMINISTRADOR o VENDEDOR
function RutaAdmin({ children }) {
  const { autenticado, esAdmin, esVendedor } = useAuth();
  if (!autenticado) return <Navigate to="/login" replace />;
  if (!esAdmin && !esVendedor) return <Navigate to="/" replace />;
  return children;
}

// 2. Solo entra ADMINISTRADOR; cualquier otro (ej. VENDEDOR) va a Productos
function RutaSoloAdmin({ children }) {
  const { esAdmin } = useAuth();
  if (!esAdmin) return <Navigate to="/admin/productos" replace />;
  return children;
}

// 3. Bloquea la tienda pública para el vendedor y lo envía directo a Productos
function RutaTienda({ children }) {
  const { esVendedor } = useAuth();
  if (esVendedor) return <Navigate to="/admin/productos" replace />;
  return children;
}

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [searchParams] = useSearchParams();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(searchParams.get('categoria') || '');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch (err) {
        setError(err.message);
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
      <Navbar />

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
              Verifica que el microservicio admin esté corriendo en el puerto 8082.
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
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RutaTienda><Home /></RutaTienda>} />
        <Route path="/productos" element={<RutaTienda><Catalogo /></RutaTienda>} />
        <Route path="/nosotros" element={<RutaTienda><Nosotros /></RutaTienda>} />
        <Route path="/blogs" element={<RutaTienda><Blogs /></RutaTienda>} />
        <Route path="/blogs/:id" element={<RutaTienda><BlogDetalle /></RutaTienda>} />
        <Route path="/contacto" element={<RutaTienda><Contacto /></RutaTienda>} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/productos/:codigo"
          element={<RutaTienda><DetalleProducto /></RutaTienda>}
        />
        <Route path="/carrito" element={<RutaTienda><Carrito /></RutaTienda>} />
        <Route path="/mis-encargos" element={<RutaTienda><MisEncargos /></RutaTienda>} />
        <Route
          path="/admin"
          element={
            <RutaAdmin>
              <LayoutAdmin />
            </RutaAdmin>
          }
        >
          <Route
            index
            element={
              <RutaSoloAdmin>
                <DashboardAdmin />
              </RutaSoloAdmin>
            }
          />
          <Route path="productos" element={<PanelAdmin />} />
          <Route path="encargos" element={<EncargosAdmin />} />
          <Route
            path="clientes"
            element={
              <RutaSoloAdmin>
                <PersonasAdmin key="cliente" tipo="cliente" />
              </RutaSoloAdmin>
            }
          />
          <Route
            path="empleados"
            element={
              <RutaSoloAdmin>
                <PersonasAdmin key="empleado" tipo="empleado" />
              </RutaSoloAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/admin/productos" replace />} />
        </Route>
        <Route path="/checkout" element={<RutaTienda><Checkout /></RutaTienda>} />
        <Route path="/compra-exitosa" element={<RutaTienda><CompraExitosa /></RutaTienda>} />
        <Route path="/compra-fallida" element={<RutaTienda><CompraFallida /></RutaTienda>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;