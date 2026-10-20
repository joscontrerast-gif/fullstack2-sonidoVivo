import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerProductos } from '../services/productos.js';
import { obtenerCarrito } from '../services/carrito.js';
import FormularioCheckout from '../modules/compra/components/FormularioCheckout.jsx';
import ResumenCompra from '../modules/compra/components/ResumenCompra.jsx';
import {
  confirmarCompra,
  obtenerCostoEntrega,
} from '../modules/compra/services/compraService.js';

function Checkout() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [entrega, setEntrega] = useState('estandar');

  const carrito = obtenerCarrito();

  useEffect(() => {
    async function cargarProductos() {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch {
        setError('No se pudieron cargar los productos.');
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, []);

  const productosCompra = carrito
    .map((item) => {
      const producto = productos.find(
        (p) => String(p.codigo) === String(item.codigo)
      );

      return producto
        ? { ...producto, cantidad: Number(item.cantidad) || 1 }
        : null;
    })
    .filter(Boolean);

  const costoEntrega = obtenerCostoEntrega(entrega);

  function manejarConfirmacion(datos) {
    setError('');

    try {
      const resultado = confirmarCompra(productosCompra, datos);

      if (!resultado.exito) {
        setError(resultado.mensaje);
        return;
      }

      navigate('/compra-exitosa', { state: { compra: resultado.resumen } });
    } catch {
      navigate('/compra-fallida', {
        state: { motivo: 'Ocurrió un error inesperado al registrar la compra.' },
      });
    }
  }

  if (cargando) {
    return <main className="container py-5">Cargando checkout...</main>;
  }

  if (productosCompra.length === 0 && !error) {
    return (
      <main className="container py-5">
        <h1>Finalizar compra</h1>
        <div className="alert alert-info mt-3">
          Tu carrito está vacío.
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
          <Link to="/carrito" className="btn btn-outline-light">
            Volver al carrito
          </Link>
        </div>
      </nav>

      <main className="container py-4">
        <h1 className="mb-4">Finalizar compra</h1>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row g-4">
          <section className="col-lg-7">
            <FormularioCheckout
              onConfirmar={manejarConfirmacion}
              onEntregaChange={setEntrega}
            />
          </section>

          <aside className="col-lg-5">
            <ResumenCompra
              productos={productosCompra}
              costoEntrega={costoEntrega}
            />
          </aside>
        </div>
      </main>
    </>
  );
}

export default Checkout;
