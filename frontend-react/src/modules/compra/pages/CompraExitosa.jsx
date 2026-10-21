import { Link, useLocation } from 'react-router-dom';
import ResumenCompra from '../components/ResumenCompra.jsx';

function CompraExitosa() {
  const location = useLocation();
  const compra = location.state?.compra;

  if (!compra) {
    return (
      <main className="container py-5">
        <div className="alert alert-info">
          No hay una compra reciente para mostrar.
        </div>
        <Link to="/" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold">
            Sonido Vivo
          </Link>
        </div>
      </nav>

      <main className="container py-4">
        <div className="alert alert-success" role="status">
          <h1 className="h3">¡Compra confirmada!</h1>
          <p className="mb-0">
            La compra se ha registrado como una simulación.
          </p>
        </div>

        <div className="row g-4">
          <section className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <h2 className="h4">Datos de la compra</h2>
                <p><strong>Fecha:</strong> {compra.fecha}</p>
                <p><strong>Dirección:</strong> {compra.direccion}</p>
                <p><strong>Comuna:</strong> {compra.comuna}</p>
                <p className="mb-0"><strong>Entrega:</strong> {compra.entrega}</p>
              </div>
            </div>
          </section>

          <aside className="col-lg-7">
            <ResumenCompra
              productos={compra.productos}
              costoEntrega={compra.costoEntrega}
              titulo="Resumen de compra"
            />
          </aside>
        </div>

        <Link to="/" className="btn btn-primary mt-4">
          Volver a la tienda
        </Link>
      </main>
    </>
  );
}

export default CompraExitosa;
