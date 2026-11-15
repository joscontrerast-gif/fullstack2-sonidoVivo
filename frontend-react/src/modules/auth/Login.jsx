import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ROLES_PANEL, useAuth } from './AuthContext.jsx';

// Pantalla de inicio de sesión: valida los campos, pide el token al backend
// y lleva al usuario al panel (empleados) o a la tienda (clientes).
function Login() {
  const { usuario, iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const destinoPorDefecto = (rol) => (ROLES_PANEL.includes(rol) ? '/admin' : '/');

  if (usuario) {
    return (
      <Navigate
        to={ubicacion.state?.desde || destinoPorDefecto(usuario.rol)}
        replace
      />
    );
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorGeneral('');

    const nuevos = {};

    if (!correo.trim()) {
      nuevos.correo = 'El correo es obligatorio.';
    } else if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      nuevos.correo = 'Ingresa un correo válido.';
    }

    if (!password) {
      nuevos.password = 'La contraseña es obligatoria.';
    }

    setErrores(nuevos);

    if (Object.keys(nuevos).length > 0) {
      return;
    }

    setEnviando(true);

    try {
      const logueado = await iniciarSesion(correo.trim(), password);

      navegar(ubicacion.state?.desde || destinoPorDefecto(logueado.rol), {
        replace: true,
      });
    } catch (error) {
      setErrorGeneral(error.message || 'No se pudo iniciar sesión.');
      setEnviando(false);
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: '460px' }}>
      <h1 className="fw-bold mb-1">Iniciar sesión</h1>
      <p className="text-secondary">Ingresa con tu cuenta de Sonido Vivo.</p>

      {errorGeneral && (
        <div className="alert alert-danger" role="alert">
          {errorGeneral}
        </div>
      )}

      <form onSubmit={manejarEnvio} noValidate>
        <div className="mb-3">
          <label htmlFor="correo" className="form-label">
            Correo
          </label>
          <input
            id="correo"
            type="email"
            className={`form-control${errores.correo ? ' is-invalid' : ''}`}
            value={correo}
            onChange={(evento) => setCorreo(evento.target.value)}
            autoComplete="username"
          />
          {errores.correo && (
            <div className="invalid-feedback">{errores.correo}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className={`form-control${errores.password ? ' is-invalid' : ''}`}
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            autoComplete="current-password"
          />
          {errores.password && (
            <div className="invalid-feedback">{errores.password}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-3 mb-0">
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link> ·{' '}
        <Link to="/">Volver a la tienda</Link>
      </p>
    </main>
  );
}

export default Login;
