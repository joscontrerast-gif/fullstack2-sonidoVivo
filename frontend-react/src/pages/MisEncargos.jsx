import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import { obtenerMisEncargos } from '../services/encargos.js';
import { formatoPrecio } from '../modules/compra/services/compraService.js';

const ESTADOS = {
  PENDIENTE: { texto: 'Pendiente', clase: 'bg-warning text-dark' },
  EN_PROCESO: { texto: 'En proceso', clase: 'bg-info text-dark' },
  COMPLETADO: { texto: 'Completado', clase: 'bg-success' },
  CANCELADO: { texto: 'Cancelado', clase: 'bg-secondary' },
};

const ENTREGAS = {
  ESTANDAR: 'Entrega estándar',
  EXPRESS: 'Entrega express',
  RETIRO: 'Retiro en tienda',
};

function formatoFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? String(fecha) : d.toLocaleString('es-CL');
}

function MisEncargos() {
  const { autenticado } = useAuth();
  const [encargos, setEncargos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!autenticado) {
      setCargando(false);
      return undefined;
    }
    let activo = true;

    async function cargar() {
      try {
        const datos = await obtenerMisEncargos();
        if (activo) setEncargos(datos);
      } catch (err) {
        if (activo) {
          setError(
            err.status === 401
              ? 'Tu sesión expiró. Vuelve a iniciar sesión.'
              : err.message || 'No se pudieron cargar tus encargos.'
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [autenticado]);

  return (
    <>
      <Navbar />
      <main className="container py-4">
        <h1 className="h3 mb-4">Mis encargos</h1>

        {!autenticado && (
          <div className="alert alert-info">
            Inicia sesión para ver los encargos que has hecho.{' '}
            <Link to="/login">Iniciar sesión</Link>
          </div>
        )}

        {autenticado && cargando && <p>Cargando tus encargos...</p>}

        {autenticado && error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        {autenticado && !cargando && !error && encargos.length === 0 && (
          <div className="alert alert-light border">
            Aún no has hecho ningún encargo.{' '}
            <Link to="/productos">Ver productos</Link>
          </div>
        )}

        {encargos.map((e) => {
          const estado = ESTADOS[e.estado] ?? { texto: e.estado, clase: 'bg-secondary' };
          const subtotal = (e.productos ?? []).reduce((s, p) => s + Number(p.subtotal), 0);

          return (
            <section key={e.id} className="card mb-3" aria-label={`Encargo ${e.numeroOrden}`}>
              <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <strong>{e.numeroOrden}</strong>
                  <span className="text-muted small ms-2">{formatoFecha(e.fecha)}</span>
                </div>
                <span className={`badge ${estado.clase}`}>{estado.texto}</span>
              </div>

              <div className="card-body">
                {(e.productos ?? []).map((p) => (
                  <div key={p.codigo} className="d-flex justify-content-between gap-3 mb-2">
                    <span>{p.nombre} × {p.cantidad}</span>
                    <span>{formatoPrecio(p.subtotal)}</span>
                  </div>
                ))}

                <hr />

                <div className="d-flex justify-content-between small">
                  <span>Subtotal</span>
                  <span>{formatoPrecio(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span>{ENTREGAS[e.tipoEntrega] ?? e.tipoEntrega}</span>
                  <span>{formatoPrecio(e.costoEntrega)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold mt-1">
                  <span>Total</span>
                  <span>{formatoPrecio(e.total)}</span>
                </div>

                {e.direccionEnvio && (
                  <p className="text-muted small mt-3 mb-0">
                    Envío a: {e.direccionEnvio}{e.comuna ? `, ${e.comuna}` : ''}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}

export default MisEncargos;
