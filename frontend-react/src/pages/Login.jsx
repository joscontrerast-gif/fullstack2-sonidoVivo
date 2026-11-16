import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await login(correo.trim(), password);
      if (res.usuario?.rol === 'ADMINISTRADOR') {
        navigate('/admin');
      } else if (res.usuario?.rol === 'VENDEDOR') {
        navigate('/admin/productos');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h1 className="h3 fw-bold mb-3">Iniciar sesión</h1>
                <p className="text-secondary small mb-4">
                  Ingresa con tu cuenta de Sonido Vivo para guardar tu carrito y gestionar tus compras.
                </p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={manejarEnvio}>
                  <div className="mb-3">
                    <label htmlFor="correo" className="form-label">
                      Correo electrónico
                    </label>
                    <input
                      id="correo"
                      type="email"
                      className="form-control"
                      placeholder="usuario@sonidovivo.cl"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={cargando}
                  >
                    {cargando ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </form>

                <p className="text-center small mt-3 mb-0">
                  ¿No tienes cuenta?{' '}
                  <Link to="/registro">Regístrate aquí</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;