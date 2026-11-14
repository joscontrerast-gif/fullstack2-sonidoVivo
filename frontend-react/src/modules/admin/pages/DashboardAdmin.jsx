import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerToken } from '../../../services/api.js';
import TablaEncargos from '../components/TablaEncargos.jsx';
import {
  ESTADOS_ENCARGO,
  listarPendientes,
  listarPendientesApi,
  resumenEncargos,
  resumenEncargosApi,
} from '../services/encargosService.js';

function DashboardAdmin() {
  const [resumen, setResumen] = useState(() =>
    obtenerToken()
      ? { total: 0, Pendiente: 0, 'En Proceso': 0, Completado: 0, Cancelado: 0 }
      : resumenEncargos()
  );
  const [pendientes, setPendientes] = useState(() =>
    obtenerToken() ? [] : listarPendientes()
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!obtenerToken()) return;

    async function cargarDashboard() {
      try {
        const [datosResumen, datosPendientes] = await Promise.all([
          resumenEncargosApi(),
          listarPendientesApi(),
        ]);
        setResumen(datosResumen);
        setPendientes(datosPendientes);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el dashboard.');
      }
    }

    cargarDashboard();
  }, []);

  return (
    <>
      <h1 className="fw-bold mb-4">Dashboard</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

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
                  {resumen[estado] ?? 0}
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