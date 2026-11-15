import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROLES_PANEL, useAuth } from './AuthContext.jsx';

/**
 * Protege un grupo de rutas (se usa como ruta "layout" con <Outlet />).
 * - Sin sesión: manda al login y recuerda a dónde quería entrar.
 * - Con sesión pero sin el rol necesario: muestra "acceso denegado".
 */
function RutaProtegida({ rolesPermitidos = ROLES_PANEL }) {
  const { usuario } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) {
    return (
      <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
    );
  }

  if (!rolesPermitidos.includes(usuario.rol)) {
    return (
      <section className="container py-5" role="alert">
        <h1 className="h3 fw-bold">Acceso denegado</h1>
        <p className="text-secondary">
          Tu cuenta no tiene permisos para ver esta sección.
        </p>
        <Link to="/" className="btn btn-primary">
          Volver a la tienda
        </Link>
      </section>
    );
  }

  return <Outlet />;
}

export default RutaProtegida;
