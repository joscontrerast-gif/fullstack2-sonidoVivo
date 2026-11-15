import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  obtenerRegiones,
  obtenerComunas,
  registrarUsuario,
} from '../services/auth.js';
import Navbar from '../components/Navbar.jsx';

function Registro() {
  const navigate = useNavigate();

  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [idRegion, setIdRegion] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    run: '',
    correo: '',
    password: '',
    idComuna: '',
    direccion: '',
  });

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    obtenerRegiones()
      .then(setRegiones)
      .catch(() => setRegiones([]));
  }, []);

  useEffect(() => {
    if (!idRegion) {
      setComunas([]);
      return;
    }
    obtenerComunas(idRegion)
      .then(setComunas)
      .catch(() => setComunas([]));
  }, [idRegion]);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      await registrarUsuario({
        nombre: form.nombre.trim(),
        apellidos: form.apellidos.trim(),
        run: form.run.trim() || null,
        correo: form.correo.trim(),
        password: form.password,
        idComuna: form.idComuna ? Number(form.idComuna) : null,
        direccion: form.direccion.trim() || null,
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'No se pudo completar el registro.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <h1 className="h3 fw-bold mb-3">Crear cuenta</h1>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={manejarEnvio}>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label htmlFor="run" className="form-label">RUN</label>
                      <input
                        id="run"
                        name="run"
                        type="text"
                        className="form-control"
                        placeholder="12345678K"
                        value={form.run}
                        onChange={manejarCambio}
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="nombre" className="form-label">Nombre *</label>
                      <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        className="form-control"
                        value={form.nombre}
                        onChange={manejarCambio}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="apellidos" className="form-label">Apellidos</label>
                      <input
                        id="apellidos"
                        name="apellidos"
                        type="text"
                        className="form-control"
                        value={form.apellidos}
                        onChange={manejarCambio}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="correo" className="form-label">Correo *</label>
                      <input
                        id="correo"
                        name="correo"
                        type="email"
                        className="form-control"
                        value={form.correo}
                        onChange={manejarCambio}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="password" className="form-label">Contraseña (6-20 caracteres) *</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        minLength={6}
                        maxLength={20}
                        className="form-control"
                        value={form.password}
                        onChange={manejarCambio}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="region" className="form-label">Región</label>
                      <select
                        id="region"
                        className="form-select"
                        value={idRegion}
                        onChange={(e) => {
                          setIdRegion(e.target.value);
                          setForm((prev) => ({ ...prev, idComuna: '' }));
                        }}
                      >
                        <option value="">-- Seleccionar región --</option>
                        {regiones.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="idComuna" className="form-label">Comuna</label>
                      <select
                        id="idComuna"
                        name="idComuna"
                        className="form-select"
                        value={form.idComuna}
                        onChange={manejarCambio}
                        disabled={!idRegion}
                      >
                        <option value="">-- Seleccionar comuna --</option>
                        {comunas.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label htmlFor="direccion" className="form-label">Dirección</label>
                      <input
                        id="direccion"
                        name="direccion"
                        type="text"
                        className="form-control"
                        placeholder="Ej: Av. Libertad 450"
                        value={form.direccion}
                        onChange={manejarCambio}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mt-4"
                    disabled={cargando}
                  >
                    {cargando ? 'Registrando...' : 'Registrarse'}
                  </button>
                </form>

                <p className="text-center small mt-3 mb-0">
                  ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Registro;