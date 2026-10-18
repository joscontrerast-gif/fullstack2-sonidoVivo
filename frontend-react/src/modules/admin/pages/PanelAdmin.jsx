import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { codigoDe } from '../../../data/productos.js';
import TablaProductos from '../components/TablaProductos.jsx';
import FormularioProducto from '../components/FormularioProducto.jsx';
import {
  borrarProducto,
  calcularResumen,
  filtrarProductos,
  guardarProducto,
  listarProductos,
  obtenerCategorias,
  obtenerCategoriasFormulario,
} from '../services/adminService.js';

function PanelAdmin() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [vista, setVista] = useState('lista'); // 'lista' | 'formulario'
  const [productoEditando, setProductoEditando] = useState(null);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const cargarProductos = useCallback(async () => {
    try {
      setProductos(await listarProductos());
      setError('');
    } catch (errorCarga) {
      setError(errorCarga.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const categoriasFiltro = useMemo(
    () => obtenerCategorias(productos),
    [productos]
  );
  const categoriasFormulario = useMemo(
    () => obtenerCategoriasFormulario(productos),
    [productos]
  );
  const resumen = useMemo(() => calcularResumen(productos), [productos]);

  // Si la categoría filtrada deja de existir (p. ej. al eliminar su último
  // producto), se vuelve a mostrar todo.
  const categoriaActiva = categoriasFiltro.includes(filtroCategoria)
    ? filtroCategoria
    : 'todos';

  const productosVisibles = filtrarProductos(productos, {
    categoria: categoriaActiva,
    busqueda,
  });

  function abrirFormularioNuevo() {
    setMensaje('');
    setProductoEditando(null);
    setProductoAEliminar(null);
    setVista('formulario');
  }

  function abrirFormularioEdicion(producto) {
    setMensaje('');
    setProductoEditando(producto);
    setProductoAEliminar(null);
    setVista('formulario');
  }

  function volverALista() {
    setProductoEditando(null);
    setVista('lista');
  }

  async function manejarGuardado(valores) {
    const codigoOriginal = productoEditando ? codigoDe(productoEditando) : null;
    const resultado = await guardarProducto(valores, codigoOriginal);

    if (resultado.ok) {
      await cargarProductos();
      setMensaje(
        codigoOriginal
          ? 'Producto actualizado con éxito.'
          : 'Producto creado con éxito.'
      );
      volverALista();
    }

    return resultado;
  }

  async function confirmarEliminacion() {
    const codigo = codigoDe(productoAEliminar);

    try {
      await borrarProducto(codigo);
      await cargarProductos();
      setMensaje('Producto eliminado con éxito.');
    } catch (errorEliminar) {
      setMensaje('');
      setError(errorEliminar.message);
    } finally {
      setProductoAEliminar(null);
    }
  }

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand fw-bold">
            Sonido Vivo · Administración
          </span>

          <Link to="/" className="btn btn-outline-light btn-sm">
            Ir a la tienda
          </Link>
        </div>
      </nav>

      <main className="container py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
          <h1 className="fw-bold mb-0">Panel administrativo</h1>

          {vista === 'lista' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirFormularioNuevo}
            >
              Nuevo producto
            </button>
          )}
        </div>

        {mensaje && (
          <div className="alert alert-success" role="status">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {cargando && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}

        {!cargando && vista === 'formulario' && (
          <section className="card shadow-sm">
            <div className="card-body">
              <h2 className="h4 mb-3">
                {productoEditando ? 'Editar producto' : 'Nuevo producto'}
              </h2>

              <FormularioProducto
                key={productoEditando ? codigoDe(productoEditando) : 'nuevo'}
                productoInicial={productoEditando}
                categorias={categoriasFormulario}
                onGuardar={manejarGuardado}
                onCancelar={volverALista}
              />
            </div>
          </section>
        )}

        {!cargando && vista === 'lista' && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-sm-4">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <p className="text-secondary mb-1">Total de productos</p>
                    <p className="h3 mb-0" data-testid="resumen-total">
                      {resumen.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-sm-4">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <p className="text-secondary mb-1">Con stock crítico</p>
                    <p
                      className="h3 mb-0 text-danger"
                      data-testid="resumen-criticos"
                    >
                      {resumen.criticos}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-sm-4">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <p className="text-secondary mb-1">Sin stock</p>
                    <p className="h3 mb-0" data-testid="resumen-sin-stock">
                      {resumen.sinStock}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {productoAEliminar && (
              <div className="alert alert-warning" role="alert">
                <p className="mb-2">
                  ¿Eliminar el producto &quot;{productoAEliminar.nombre}&quot; (
                  {codigoDe(productoAEliminar)})? Esta acción no se puede
                  deshacer.
                </p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={confirmarEliminacion}
                  >
                    Confirmar eliminación
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setProductoAEliminar(null)}
                  >
                    Cancelar eliminación
                  </button>
                </div>
              </div>
            )}

            <div className="row g-3 mb-3">
              <div className="col-md-7">
                <label htmlFor="busqueda" className="form-label">
                  Buscar producto
                </label>
                <input
                  id="busqueda"
                  type="search"
                  className="form-control"
                  placeholder="Código, nombre, marca o modelo..."
                  value={busqueda}
                  onChange={(evento) => setBusqueda(evento.target.value)}
                />
              </div>

              <div className="col-md-5">
                <label htmlFor="filtro-categoria" className="form-label">
                  Filtrar por categoría
                </label>
                <select
                  id="filtro-categoria"
                  className="form-select"
                  value={categoriaActiva}
                  onChange={(evento) => setFiltroCategoria(evento.target.value)}
                >
                  <option value="todos">Todas las categorías</option>
                  {categoriasFiltro.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TablaProductos
              productos={productosVisibles}
              onEditar={abrirFormularioEdicion}
              onEliminar={setProductoAEliminar}
            />
          </>
        )}
      </main>
    </>
  );
}

export default PanelAdmin;
