import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerProductos } from '../services/productos.js';
import { obtenerCarritoApi } from '../services/carrito.js';
import { obtenerToken } from '../services/api.js';
import Navbar from '../components/Navbar.jsx';
import FormularioCheckout from '../modules/compra/components/FormularioCheckout.jsx';
import ResumenCompra from '../modules/compra/components/ResumenCompra.jsx';
import {
  confirmarCompra,
  obtenerCostoEntrega,
} from '../modules/compra/services/compraService.js';

function Checkout() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [entrega, setEntrega] = useState('estandar');

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [datosProductos, datosCarrito] = await Promise.all([
          obtenerProductos(),
          obtenerCarritoApi(),
        ]);
        setProductos(datosProductos);
        setCarrito(datosCarrito);
      } catch {
        setError('No se pudieron cargar los productos.');
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
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

  async function manejarConfirmacion(datos) {
    setError('');

    try {
      const resultado = await confirmarCompra(productosCompra, datos);

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
      <Navbar
        mostrarCarrito={false}
        enlaceExtra={
          <Link to="/carrito" className="btn btn-outline-light btn-sm">
            Volver al carrito
          </Link>
        }
      />

      <main className="container py-4">
        <h1 className="mb-4">Finalizar compra</h1>

        {!obtenerToken() && (
          <div className="alert alert-info" role="status">
            Estás comprando como invitado: la compra se simula y no queda
            registrada. <Link to="/login">Inicia sesión</Link> para guardar tu
            pedido.
          </div>
        )}

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