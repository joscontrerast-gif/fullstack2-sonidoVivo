import { useCallback, useEffect, useState } from 'react';
import { obtenerToken } from '../../../services/api.js';
import TablaEncargos from '../components/TablaEncargos.jsx';
import {
  ESTADOS_ENCARGO,
  cambiarEstado,
  cambiarEstadoApi,
  formatearTotal,
  listarEncargos,
  listarEncargosApi,
  textoEntrega,
} from '../services/encargosService.js';

function EncargosAdmin() {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [encargos, setEncargos] = useState(() =>
    obtenerToken() ? [] : listarEncargos()
  );
  const [detalle, setDetalle] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const recargar = useCallback(async (filtro = filtroEstado) => {
    try {
      const datos = await listarEncargosApi(filtro);
      setEncargos(datos);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los encargos.');
    }
  }, [filtroEstado]);

  useEffect(() => {
    if (obtenerToken()) {
      recargar(filtroEstado);
    }
  }, [filtroEstado, recargar]);

  function manejarFiltro(evento) {
    const filtro = evento.target.value;
    setFiltroEstado(filtro);
    if (!obtenerToken()) {
      setEncargos(listarEncargos(filtro));
    }
  }

  async function manejarCambioEstado(id, nuevoEstado) {
    setMensaje('');
    setError('');

    try {
      if (!obtenerToken()) {
        const actualizado = cambiarEstado(id, nuevoEstado);
        setEncargos(listarEncargos(filtroEstado));
        setMensaje(
          `El estado del encargo ${id} fue actualizado a: ${nuevoEstado}`
        );
        setDetalle((actual) =>
          actual && actual.id === id ? actualizado : actual
        );
        return;
      }

      const actualizado = await cambiarEstadoApi(id, nuevoEstado);
      await recargar(filtroEstado);
      setMensaje(
        `El estado del encargo ${id} fue actualizado a: ${nuevoEstado}`
      );
      setDetalle((actual) => (actual && actual.id === id ? actualizado : actual));
    } catch (errorCambio) {
      setError(errorCambio.message);
    }
  }

  return (
    <>
      <h1 className="fw-bold mb-4">Encargos</h1>

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

      {detalle && (
        <section className="card shadow-sm mb-4" aria-label="Detalle del encargo">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <h2 className="h5">Detalle de la orden {detalle.numeroOrden || detalle.id}</h2>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setDetalle(null)}
              >
                Cerrar detalle
              </button>
            </div>

            <dl className="row mb-0">
              <dt className="col-sm-3">Fecha</dt>
              <dd className="col-sm-9">{detalle.fecha}</dd>
              <dt className="col-sm-3">Cliente</dt>
              <dd className="col-sm-9">{detalle.cliente}</dd>
              <dt className="col-sm-3">Correo</dt>
              <dd className="col-sm-9">{detalle.correo || 'N/A'}</dd>
              <dt className="col-sm-3">Total</dt>
              <dd className="col-sm-9">{formatearTotal(detalle.total)}</dd>
              <dt className="col-sm-3">Entrega</dt>
              <dd className="col-sm-9">{textoEntrega(detalle.tipoEntrega)}</dd>
              <dt className="col-sm-3">Estado</dt>
              <dd className="col-sm-9">{detalle.estado}</dd>
            </dl>
          </div>
        </section>
      )}

      <div className="mb-3 col-md-5 col-lg-4 px-0">
        <label htmlFor="filtro-estado" className="form-label">
          Filtrar por estado
        </label>
        <select
          id="filtro-estado"
          className="form-select"
          value={filtroEstado}
          onChange={manejarFiltro}
        >
          <option value="todos">Todos los estados</option>
          {ESTADOS_ENCARGO.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      <TablaEncargos
        encargos={encargos}
        onCambiarEstado={manejarCambioEstado}
        onVerDetalle={setDetalle}
      />
    </>
  );
}

export default EncargosAdmin;