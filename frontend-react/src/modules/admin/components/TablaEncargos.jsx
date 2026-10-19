import {
  ESTADOS_ENCARGO,
  formatearTotal,
} from '../services/encargosService.js';

const COLOR_ESTADO = {
  Pendiente: 'text-bg-warning',
  'En Proceso': 'text-bg-info',
  Completado: 'text-bg-success',
  Cancelado: 'text-bg-secondary',
};

/**
 * Tabla de encargos.
 * - Con soloLectura (dashboard) el estado se muestra como etiqueta y no hay acciones.
 * - Si no, el estado es editable y hay un botón para ver el detalle.
 */
function TablaEncargos({
  encargos,
  soloLectura = false,
  onCambiarEstado = () => {},
  onVerDetalle = () => {},
  textoVacio = 'No hay encargos registrados.',
}) {
  if (encargos.length === 0) {
    return <div className="alert alert-info mb-0">{textoVacio}</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th scope="col">N° orden</th>
            <th scope="col">Fecha</th>
            <th scope="col">Cliente</th>
            <th scope="col">Total</th>
            <th scope="col">Estado</th>
            {!soloLectura && (
              <th scope="col" className="text-end">
                Acciones
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {encargos.map((encargo) => (
            <tr key={encargo.id}>
              <td className="fw-bold">{encargo.id}</td>
              <td>{encargo.fecha}</td>
              <td>{encargo.cliente}</td>
              <td>{formatearTotal(encargo.total)}</td>
              <td>
                {soloLectura ? (
                  <span
                    className={`badge ${
                      COLOR_ESTADO[encargo.estado] || 'text-bg-secondary'
                    }`}
                  >
                    {encargo.estado}
                  </span>
                ) : (
                  <select
                    className="form-select form-select-sm"
                    aria-label={`Estado de ${encargo.id}`}
                    value={encargo.estado}
                    onChange={(evento) =>
                      onCambiarEstado(encargo.id, evento.target.value)
                    }
                  >
                    {ESTADOS_ENCARGO.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              {!soloLectura && (
                <td className="text-end text-nowrap">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    aria-label={`Ver detalle ${encargo.id}`}
                    onClick={() => onVerDetalle(encargo)}
                  >
                    Ver detalle
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaEncargos;
