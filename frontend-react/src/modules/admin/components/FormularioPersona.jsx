import { useState } from 'react';
import { obtenerComunas, REGIONES } from '../../../data/regiones.js';
import { claveDe } from '../../../data/usuarios.js';
import { LIMITES_PERSONA } from '../services/validaciones.js';
import { ROLES_EMPLEADO, rolDe } from '../services/personasService.js';
import Campo from './Campo.jsx';

const VALORES_VACIOS = {
  run: '',
  nombre: '',
  apellidos: '',
  correo: '',
  rol: '',
  region: '',
  comuna: '',
  direccion: '',
  contrasena: '',
  confirmarContrasena: '',
};

function desdePersona(persona) {
  if (!persona) {
    return VALORES_VACIOS;
  }

  // Los empleados antiguos pueden venir como "Empleado": equivale a Vendedor.
  const rol = rolDe(persona);

  return {
    ...VALORES_VACIOS,
    run: persona.run ?? '',
    nombre: persona.nombre ?? '',
    apellidos: persona.apellidos ?? '',
    correo: persona.correo ?? '',
    rol: ROLES_EMPLEADO.includes(rol) ? rol : rol === 'Empleado' ? 'Vendedor' : '',
    region: persona.region ?? '',
    comuna: persona.comuna ?? '',
    direccion: persona.direccion ?? '',
  };
}

// Opciones de un select; si el valor guardado no está en la lista
// (datos antiguos) se agrega para no perderlo al editar.
function conValorActual(opciones, actual) {
  return actual && !opciones.includes(actual) ? [...opciones, actual] : opciones;
}

/**
 * Formulario de creación / edición de clientes y empleados.
 * - tipo: 'cliente' | 'empleado' (los empleados tienen además un rol).
 * - personaInicial: null para crear, la persona para editar.
 * - onGuardar(valores): debe devolver { ok, errores } (ver guardarPersona).
 */
function FormularioPersona({
  tipo,
  personaInicial = null,
  onGuardar,
  onCancelar,
}) {
  const modoEdicion = Boolean(personaInicial);
  const [valores, setValores] = useState(() => desdePersona(personaInicial));
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);

  const regiones = conValorActual(
    REGIONES.map((region) => region.nombre),
    valores.region
  );
  const comunas = conValorActual(obtenerComunas(valores.region), valores.comuna);

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setValores((anteriores) => ({
      ...anteriores,
      [name]: value,
      // Al cambiar de región, la comuna anterior deja de ser válida.
      ...(name === 'region' ? { comuna: '' } : {}),
    }));
    setErrores((anteriores) => ({
      ...anteriores,
      [name]: undefined,
      ...(name === 'region' ? { comuna: undefined } : {}),
    }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorGeneral('');
    setGuardando(true);

    try {
      const resultado = await onGuardar(valores);

      if (resultado && !resultado.ok) {
        setErrores(resultado.errores || {});
      }
    } catch (error) {
      setErrorGeneral(error.message || 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  }

  function propsCampo(nombre) {
    return {
      id: nombre,
      name: nombre,
      value: valores[nombre],
      onChange: manejarCambio,
      className: `form-control${errores[nombre] ? ' is-invalid' : ''}`,
      'aria-invalid': errores[nombre] ? 'true' : 'false',
      'aria-describedby': errores[nombre] ? `${nombre}-error` : undefined,
    };
  }

  function propsSelect(nombre) {
    return {
      ...propsCampo(nombre),
      className: `form-select${errores[nombre] ? ' is-invalid' : ''}`,
    };
  }

  const marca = modoEdicion ? '' : ' *';

  return (
    <form onSubmit={manejarEnvio} noValidate>
      {errorGeneral && (
        <div className="alert alert-danger" role="alert">
          {errorGeneral}
        </div>
      )}

      <div className="row">
        <div className="col-md-4">
          <Campo id="run" etiqueta="RUN *" error={errores.run}>
            <input
              {...propsCampo('run')}
              type="text"
              placeholder="12345678K"
              readOnly={modoEdicion}
            />
            {modoEdicion && !valores.run && (
              <div className="form-text">
                Este usuario no tiene RUN registrado ({claveDe(personaInicial)}).
              </div>
            )}
          </Campo>
        </div>

        <div className="col-md-4">
          <Campo id="nombre" etiqueta="Nombre *" error={errores.nombre}>
            <input
              {...propsCampo('nombre')}
              type="text"
              placeholder="Ej: Ana"
            />
          </Campo>
        </div>

        <div className="col-md-4">
          <Campo id="apellidos" etiqueta="Apellidos *" error={errores.apellidos}>
            <input
              {...propsCampo('apellidos')}
              type="text"
              placeholder="Ej: Torres Pérez"
            />
          </Campo>
        </div>
      </div>

      <div className="row">
        <div className={tipo === 'empleado' ? 'col-md-8' : 'col-12'}>
          <Campo
            id="correo"
            etiqueta="Correo electrónico *"
            error={errores.correo}
          >
            <input
              {...propsCampo('correo')}
              type="email"
              placeholder="ejemplo@duoc.cl"
            />
          </Campo>
        </div>

        {tipo === 'empleado' && (
          <div className="col-md-4">
            <Campo id="rol" etiqueta="Rol / cargo *" error={errores.rol}>
              <select {...propsSelect('rol')}>
                <option value="">-- Seleccione rol --</option>
                {ROLES_EMPLEADO.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
        )}
      </div>

      <div className="row">
        <div className="col-md-6">
          <Campo id="region" etiqueta="Región *" error={errores.region}>
            <select {...propsSelect('region')}>
              <option value="">-- Seleccione --</option>
              {regiones.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        <div className="col-md-6">
          <Campo id="comuna" etiqueta="Comuna *" error={errores.comuna}>
            <select {...propsSelect('comuna')} disabled={!valores.region}>
              <option value="">-- Seleccione --</option>
              {comunas.map((comuna) => (
                <option key={comuna} value={comuna}>
                  {comuna}
                </option>
              ))}
            </select>
          </Campo>
        </div>
      </div>

      <Campo id="direccion" etiqueta="Dirección *" error={errores.direccion}>
        <input
          {...propsCampo('direccion')}
          type="text"
          placeholder="Ej: Av. España 123"
        />
      </Campo>

      <div className="row">
        <div className="col-md-6">
          <Campo
            id="contrasena"
            etiqueta={modoEdicion ? 'Nueva contraseña' : `Contraseña${marca}`}
            error={errores.contrasena}
          >
            <input
              {...propsCampo('contrasena')}
              type="password"
              autoComplete="new-password"
              placeholder={
                modoEdicion
                  ? 'Déjala vacía para conservar la actual'
                  : `Entre ${LIMITES_PERSONA.contrasenaMin} y ${LIMITES_PERSONA.contrasenaMax} caracteres`
              }
            />
          </Campo>
        </div>

        <div className="col-md-6">
          <Campo
            id="confirmarContrasena"
            etiqueta={
              modoEdicion
                ? 'Confirmar nueva contraseña'
                : `Confirmar contraseña${marca}`
            }
            error={errores.confirmarContrasena}
          >
            <input
              {...propsCampo('confirmarContrasena')}
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
            />
          </Campo>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {modoEdicion ? 'Guardar cambios' : 'Guardar'}
        </button>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancelar}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default FormularioPersona;
