import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';

const ENLACES = [
  { to: '/admin', etiqueta: 'Dashboard', exacto: true },
  { to: '/admin/productos', etiqueta: 'Productos' },
  { to: '/admin/encargos', etiqueta: 'Encargos' },
  { to: '/admin/clientes', etiqueta: 'Clientes', soloAdministrador: true },
  { to: '/admin/empleados', etiqueta: 'Empleados', soloAdministrador: true },
];

// Estructura común de todas las vistas administrativas: barra superior,
// menú lateral y, a la derecha, la vista activa (<Outlet />).
function LayoutAdmin() {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  // Los vendedores no administran usuarios (el backend también lo impide).
  const enlaces = ENLACES.filter(
    (enlace) => !enlace.soloAdministrador || usuario?.rol === 'ADMINISTRADOR'
  );

  function salir() {
    cerrarSesion();
    navegar('/login', { replace: true });
  }

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            Sonido Vivo · Administración
          </span>

          <div className="d-flex align-items-center gap-2">
            {usuario && (
              <span className="navbar-text text-light d-none d-sm-inline">
                {usuario.nombre} · {usuario.tipoUsuario}
              </span>
            )}

            <Link to="/" className="btn btn-outline-light btn-sm">
              Ir a la tienda
            </Link>

            <button
              type="button"
              className="btn btn-outline-warning btn-sm"
              onClick={salir}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row">
          <aside className="col-md-3 col-lg-2 bg-light border-end py-3">
            <nav
              aria-label="Menú de administración"
              className="nav nav-pills flex-md-column gap-1"
            >
              {enlaces.map((enlace) => (
                <NavLink
                  key={enlace.to}
                  to={enlace.to}
                  end={enlace.exacto}
                  className={({ isActive }) =>
                    `nav-link${isActive ? ' active' : ''}`
                  }
                >
                  {enlace.etiqueta}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="col-md-9 col-lg-10 py-4 px-md-4">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export default LayoutAdmin;
