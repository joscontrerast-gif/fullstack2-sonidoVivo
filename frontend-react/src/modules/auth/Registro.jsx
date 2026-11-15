import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authApi, ubicacionesApi } from '../../api/authApi.js';
import { ErrorApi } from '../../api/http.js';
import { normalizarRun } from '../../data/usuarios.js';
import Campo from '../admin/components/Campo.jsx';
import {
  LIMITES_PERSONA,
  validarConfirmacion,
  validarContrasena,
  validarCorreo,
  validarRun,
  validarSeleccion,
  validarTexto,
} from '../admin/services/validaciones.js';
import { useAuth } from './AuthContext.jsx';

const VALORES_INICIALES = {
  run: '',
  nombre: '',
  apellidos: '',
  correo: '',
  idRegion: '',
  idComuna: '',
  direccion: '',
  contrasena: '',
  confirmarContrasena: '',
};

// Validaciones del formulario (las mismas reglas del panel de administración).
export function validarRegistro(valores) {
  const errores = {};
  const asignar = (campo, mensaje) => {
    if (mensaje) errores[campo] = mensaje;
  };

  asignar('run', validarRun(normalizarRun(valores.run)));
  asignar('nombre', validarTexto(valores.nombre, 'El nombre', LIMITES_PERSONA.nombre));
  asignar(
    'apellidos',
    validarTexto(valores.apellidos, 'Los apellidos', LIMITES_PERSONA.apellidos)
  );
  asignar('correo', validarCorreo(valores.correo));
  asignar('idRegion', validarSeleccion(valores.idRegion, 'una región'));
  asignar('idComuna', validarSeleccion(valores.idComuna, 'una comuna'));
  asignar(
    'direccion',
    validarTexto(valores.direccion, 'La dirección', LIMITES_PERSONA.direccion)
  );
  asignar('contrasena', validarContrasena(valores.contrasena));
  asignar(
    'confirmarContrasena',
    validarConfirmacion(valores.contrasena, valores.confirmarContrasena)
  );

  return errores;
}

// Nombres de campo del backend → nombres del formulario
const CAMPO_DEL_FORMULARIO = { password: 'contrasena', idComuna: 'idComuna' };

// Registro de clientes. Al terminar inicia sesión automáticamente.
function Registro() {
  const { usuario, iniciarSesion } = useAuth();
  const navegar = useNavigate();

  const [valores, setValores] = useState(VALORES_INICIALES);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [errorUbicaciones, setErrorUbicaciones] = useState('');

  useEffect(() => {
    let activo = true;

    Promise.all([ubicacionesApi.regiones(), ubicacionesApi.comunas()])
      .then(([listaRegiones, listaComunas]) => {
        if (activo) {
          setRegiones(listaRegiones);
          setComunas(listaComunas);
        }
      })
      .catch((error) => {
        if (activo) {
          setErrorUbicaciones(
            error.message || 'No se pudieron cargar las regiones y comunas.'
          );
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const comunasDeLaRegion = useMemo(
    () => comunas.filter((comuna) => String(comuna.idRegion) === valores.idRegion),
    [comunas, valores.idRegion]
  );

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setValores((anteriores) => ({
      ...anteriores,
      [name]: value,
      // Al cambiar de región la comuna elegida deja de ser válida
      ...(name === 'idRegion' ? { idComuna: '' } : {}),
    }));
    setErrores((anteriores) => ({ ...anteriores, [name]: undefined }));
  }

  function propsCampo(nombre) {
    return {
      id: nombre,
      name: nombre,
      value: valores[nombre],
      onChange: manejarCambio,
      className: `form-control${errores[nombre] ? ' is-invalid' : ''}`,
    };
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorGeneral('');

    const nuevos = validarRegistro(valores);

    setErrores(nuevos);

    if (Object.keys(nuevos).length > 0) {
      return;
    }

    setEnviando(true);

    const correo = valores.correo.trim();

    try {
      await authApi.registrar({
        run: normalizarRun(valores.run),
        nombre: valores.nombre.trim(),
        apellidos: valores.apellidos.trim(),
        correo,
        password: valores.contrasena,
        idComuna: Number(valores.idComuna),
        direccion: valores.direccion.trim(),
      });
    } catch (error) {
      if (error instanceof ErrorApi && Object.keys(error.errores).length > 0) {
        const delServidor = {};

        Object.entries(error.errores).forEach(([campo, mensaje]) => {
          delServidor[CAMPO_DEL_FORMULARIO[campo] ?? campo] = mensaje;
        });
        setErrores(delServidor);
      } else if (error instanceof ErrorApi && error.estado === 409) {
        setErrores({ [/correo/i.test(error.message) ? 'correo' : 'run']: error.message });
      } else {
        setErrorGeneral(error.message || 'No se pudo completar el registro.');
      }

      setEnviando(false);

      return;
    }

    // Cuenta creada: se inicia sesión con los mismos datos.
    try {
      await iniciarSesion(correo, valores.contrasena);
      navegar('/', { replace: true });
    } catch {
      navegar('/login', { replace: true });
    }
  }

  return (
    <main className="container py-5" style={{ maxWidth: '640px' }}>
      <h1 className="fw-bold mb-1">Crear cuenta</h1>
      <p className="text-secondary">Regístrate para comprar en Sonido Vivo.</p>

      {errorUbicaciones && (
        <div className="alert alert-warning" role="alert">
          {errorUbicaciones}
        </div>
      )}

      {errorGeneral && (
        <div className="alert alert-danger" role="alert">
          {errorGeneral}
        </div>
      )}

      <form onSubmit={manejarEnvio} noValidate>
        <div className="row">
          <div className="col-md-6">
            <Campo id="run" etiqueta="RUN *" error={errores.run}>
              <input
                {...propsCampo('run')}
                placeholder="Ej: 12345678-5"
                maxLength={12}
              />
            </Campo>
          </div>

          <div className="col-md-6">
            <Campo id="correo" etiqueta="Correo electrónico *" error={errores.correo}>
              <input {...propsCampo('correo')} type="email" autoComplete="username" />
            </Campo>
          </div>

          <div className="col-md-6">
            <Campo id="nombre" etiqueta="Nombre *" error={errores.nombre}>
              <input {...propsCampo('nombre')} />
            </Campo>
          </div>

          <div className="col-md-6">
            <Campo id="apellidos" etiqueta="Apellidos *" error={errores.apellidos}>
              <input {...propsCampo('apellidos')} />
            </Campo>
          </div>

          <div className="col-md-6">
            <Campo id="idRegion" etiqueta="Región *" error={errores.idRegion}>
              <select
                {...propsCampo('idRegion')}
                className={`form-select${errores.idRegion ? ' is-invalid' : ''}`}
              >
                <option value="">Selecciona una región</option>
                {regiones.map((region) => (
                  <option key={region.id} value={String(region.id)}>
                    {region.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <div className="col-md-6">
            <Campo id="idComuna" etiqueta="Comuna *" error={errores.idComuna}>
              <select
                {...propsCampo('idComuna')}
                className={`form-select${errores.idComuna ? ' is-invalid' : ''}`}
                disabled={!valores.idRegion}
              >
                <option value="">Selecciona una comuna</option>
                {comunasDeLaRegion.map((comuna) => (
                  <option key={comuna.id} value={String(comuna.id)}>
                    {comuna.nombre}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        </div>

        <Campo id="direccion" etiqueta="Dirección *" error={errores.direccion}>
          <input {...propsCampo('direccion')} autoComplete="street-address" />
        </Campo>

        <div className="row">
          <div className="col-md-6">
            <Campo id="contrasena" etiqueta="Contraseña *" error={errores.contrasena}>
              <input
                {...propsCampo('contrasena')}
                type="password"
                autoComplete="new-password"
              />
            </Campo>
          </div>

          <div className="col-md-6">
            <Campo
              id="confirmarContrasena"
              etiqueta="Confirmar contraseña *"
              error={errores.confirmarContrasena}
            >
              <input
                {...propsCampo('confirmarContrasena')}
                type="password"
                autoComplete="new-password"
              />
            </Campo>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-3 mb-0">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link> ·{' '}
        <Link to="/">Volver a la tienda</Link>
      </p>
    </main>
  );
}

export default Registro;
