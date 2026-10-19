import { claveDe } from '../../../data/usuarios.js';
import {
  CONFIG_PERSONAS,
  estadoDe,
  nombreCompleto,
} from '../services/personasService.js';

// Tabla de clientes o empleados (tipo = 'cliente' | 'empleado').
function TablaPersonas({ personas, tipo, onEditar }) {
  if (personas.length === 0) {
    return (
      <div className="alert alert-info mb-0">{CONFIG_PERSONAS[tipo].vacio}</div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th scope="col">Fecha registro</th>
            <th scope="col">ID</th>
            <th scope="col">Nombre</th>
            <th scope="col">Correo</th>
            <th scope="col">{tipo === 'empleado' ? 'Rol' : 'Tipo'}</th>
            <th scope="col">Estado</th>
            <th scope="col" className="text-end">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {personas.map((persona, indice) => {
            const clave = claveDe(persona);

            return (
              <tr key={clave}>
                <td>{persona.fechaRegistro || '—'}</td>
                <td>{`U${String(indice + 1).padStart(4, '0')}`}</td>
                <td>{nombreCompleto(persona)}</td>
                <td>{persona.correo}</td>
                <td>{persona.tipoUsuario}</td>
                <td>{estadoDe(persona)}</td>
                <td className="text-end text-nowrap">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    aria-label={`Editar ${clave}`}
                    onClick={() => onEditar(persona)}
                  >
                    Editar
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

export default TablaPersonas;
