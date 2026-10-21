import { codigoDe } from '../../../data/productos.js';
import { esStockCritico, formatearPrecio } from '../services/adminService.js';

function TablaProductos({ productos, onEditar, onEliminar }) {
  if (productos.length === 0) {
    return (
      <div className="alert alert-info mb-0">
        No hay productos para mostrar.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th scope="col">Fecha ingreso</th>
            <th scope="col">Código</th>
            <th scope="col">Nombre</th>
            <th scope="col">Categoría</th>
            <th scope="col">Precio</th>
            <th scope="col">Stock</th>
            <th scope="col" className="text-end">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {productos.map((producto) => {
            const codigo = codigoDe(producto);
            const critico = esStockCritico(producto);
            const nombreCompleto = producto.marca
              ? `${producto.marca} ${producto.nombre}`
              : producto.nombre;

            return (
              <tr key={codigo}>
                <td>{producto.fechaIngreso || '—'}</td>
                <td>{codigo}</td>
                <td>{nombreCompleto}</td>
                <td>{producto.categoria}</td>
                <td>{formatearPrecio(producto.precio)}</td>
                <td className={critico ? 'text-danger fw-bold' : ''}>
                  {producto.stock}{' '}
                  {critico && (
                    <span
                      role="img"
                      aria-label="Alerta de stock crítico"
                      title="¡Stock crítico!"
                    >
                      ⚠
                    </span>
                  )}
                </td>
                <td className="text-end text-nowrap">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-2"
                    aria-label={`Editar ${codigo}`}
                    onClick={() => onEditar(producto)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    aria-label={`Eliminar ${codigo}`}
                    onClick={() => onEliminar(producto)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TablaProductos;
