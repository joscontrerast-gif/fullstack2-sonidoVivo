import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  EVENTO_CARRITO,
  contarItemsCarrito,
  obtenerCarrito,
  obtenerCarritoApi,
} from '../services/carrito.js';

function Navbar({ mostrarCarrito = true, enlaceExtra = null }) {
  const { autenticado, usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [cantidadCarrito, setCantidadCarrito] = useState(() =>
    contarItemsCarrito(obtenerCarrito())
  );

  useEffect(() => {
    let activo = true;

    async function sincronizarCarrito() {
      if (!autenticado) {
        setCantidadCarrito(contarItemsCarrito(obtenerCarrito()));
        return;
      }
      try {
        const carrito = await obtenerCarritoApi();
        if (activo) {
          setCantidadCarrito(contarItemsCarrito(carrito));
        }
      } catch {
        if (activo) {
          setCantidadCarrito(contarItemsCarrito(obtenerCarrito()));
        }
      }
    }

    sincronizarCarrito();

    function alActualizarCarrito(evento) {
      setCantidadCarrito(contarItemsCarrito(evento.detail));
    }

    function alCambiarStorage(evento) {
      if (!evento.key || evento.key === 'carritoSonidoVivo') {
        setCantidadCarrito(contarItemsCarrito(obtenerCarrito()));
      }
    }

    window.addEventListener(EVENTO_CARRITO, alActualizarCarrito);
    window.addEventListener('storage', alCambiarStorage);

    return () => {
      activo = false;
      window.removeEventListener(EVENTO_CARRITO, alActualizarCarrito);
      window.removeEventListener('storage', alCambiarStorage);
    };
  }, [autenticado]);

  function manejarLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          Sonido Vivo
        </Link>

        <div className="d-flex align-items-center flex-wrap gap-2">
          {esAdmin && (
            <Link to="/admin" className="btn btn-warning btn-sm fw-semibold">
              Panel Admin
            </Link>
          )}

          {enlaceExtra}

          {mostrarCarrito && (
            <Link
              to="/carrito"
              className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-1"
              aria-label={`Carrito (${cantidadCarrito})`}
            >
              <span>🛒 Carrito</span>
              <span className="badge rounded-pill bg-danger">
                {cantidadCarrito}
              </span>
            </Link>
          )}

          {autenticado ? (
            <>
              <span className="navbar-text text-light small mx-1">
                Hola, <strong>{usuario.nombre}</strong>
              </span>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={manejarLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn btn-primary btn-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;