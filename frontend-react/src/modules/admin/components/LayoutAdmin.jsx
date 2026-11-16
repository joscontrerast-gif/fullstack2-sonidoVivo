import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';

const ENLACES = [
  { to: '/admin', etiqueta: 'Dashboard', exacto: true },
  { to: '/admin/productos', etiqueta: 'Productos', vendedor: true },
  { to: '/admin/encargos', etiqueta: 'Encargos', vendedor: true },
  { to: '/admin/clientes', etiqueta: 'Clientes' },
  { to: '/admin/empleados', etiqueta: 'Empleados' },
];

// Estructura común de todas las vistas administrativas: barra superior,
// menú lateral y, a la derecha, la vista activa (<Outlet />).
function LayoutAdmin() {
  const { esVendedor } = useAuth();
  // El vendedor solo ve Productos y Encargos; el resto del menú es del administrador.
  const enlaces = esVendedor ? ENLACES.filter((e) => e.vendedor) : ENLACES;

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">
            Sonido Vivo · Administración
          </span>

          <Link to="/" className="btn btn-outline-light btn-sm">
            Ir a la tienda
          </Link>
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
