import { useState } from 'react';
import { Link } from 'react-router-dom';
import TablaEncargos from '../components/TablaEncargos.jsx';
import {
  ESTADOS_ENCARGO,
  listarPendientes,
  resumenEncargos,
} from '../services/encargosService.js';

// Pantalla de inicio del panel: resumen de encargos y pedidos pendientes.
function DashboardAdmin() {
  const [resumen] = useState(() => resumenEncargos());
  const [pendientes] = useState(() => listarPendientes());

  return (
    <>
      <h1 className="fw-bold mb-4">Dashboard</h1>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg">
          <div className="card text-center h-100">
            <div className="card-body">
              <p className="text-secondary mb-1">Total de encargos</p>
              <p className="h3 mb-0" data-testid="resumen-encargos-total">
                {resumen.total}
              </p>
            </div>
          </div>
        </div>

        {ESTADOS_ENCARGO.map((estado) => (
          <div className="col-6 col-lg" key={estado}>
            <div className="card text-center h-100">
              <div className="card-body">
                <p className="text-secondary mb-1">{estado}</p>
                <p className="h3 mb-0" data-testid={`resumen-encargos-${estado}`}>
                  {resumen[estado]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="h4 mb-0">Pedidos pendientes</h2>
          <Link to="/admin/encargos" className="btn btn-outline-primary btn-sm">
            Ver todos los encargos
          </Link>
        </div>

        <TablaEncargos
          encargos={pendientes}
          soloLectura
          textoVacio="No hay pedidos pendientes actualmente."
        />
      </section>
    </>
  );
}

export default DashboardAdmin;
