import { Link, useLocation } from 'react-router-dom';

function CompraFallida() {
  const location = useLocation();
  const motivo =
    location.state?.motivo || 'No pudimos procesar tu compra.';

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
        <div className="alert alert-danger" role="alert">
          <h1 className="h3">No se pudo completar la compra</h1>
          <p className="mb-0">{motivo}</p>
        </div>

        <p>Tu carrito sigue guardado. Puedes revisarlo e intentarlo de nuevo.</p>

        <Link to="/carrito" className="btn btn-primary me-2">
          Volver al carrito
        </Link>
        <Link to="/checkout" className="btn btn-outline-secondary">
          Reintentar el pago
        </Link>
      </main>
    </>
  );
}

export default CompraFallida;
