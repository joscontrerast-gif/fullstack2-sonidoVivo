import { useCallback, useEffect, useState } from 'react';
import { claveDe } from '../../../data/usuarios.js';
import { obtenerToken } from '../../../services/api.js';
import FormularioPersona from '../components/FormularioPersona.jsx';
import TablaPersonas from '../components/TablaPersonas.jsx';
import {
  CONFIG_PERSONAS,
  borrarPersona,
  borrarPersonaApi,
  filtrarEmpleados,
  guardarPersona,
  guardarPersonaApi,
  listarPersonas,
  listarPersonasApi,
  nombreCompleto,
} from '../services/personasService.js';

function PersonasAdmin({ tipo }) {
  const config = CONFIG_PERSONAS[tipo];

  const [personas, setPersonas] = useState(() =>
    obtenerToken() ? [] : listarPersonas(tipo)
  );
  const [vista, setVista] = useState('lista');
  const [personaEditando, setPersonaEditando] = useState(null);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const visibles =
    tipo === 'empleado' ? filtrarEmpleados(personas, filtro) : personas;

  const recargar = useCallback(async () => {
    try {
      const lista = await listarPersonasApi(tipo);
      setPersonas(lista);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los usuarios.');
    }
  }, [tipo]);

  useEffect(() => {
    if (obtenerToken()) {
      recargar();
    }
  }, [recargar]);

  function abrirFormularioNuevo() {
    setMensaje('');
    setError('');
    setPersonaEditando(null);
    setConfirmandoEliminar(false);
    setVista('formulario');
  }

  function abrirFormularioEdicion(persona) {
    setMensaje('');
    setError('');
    setPersonaEditando(persona);
    setConfirmandoEliminar(false);
    setVista('formulario');
  }

  function volverALista() {
    setPersonaEditando(null);
    setConfirmandoEliminar(false);
    setVista('lista');
  }

  function manejarGuardado(valores) {
    if (!obtenerToken()) {
      const claveOriginal = personaEditando ? claveDe(personaEditando) : null;
      const resultado = guardarPersona(valores, tipo, claveOriginal);
      if (resultado.ok) {
        setPersonas(listarPersonas(tipo));
        setMensaje(personaEditando ? config.actualizado : config.registrado);
        volverALista();
      }
      return resultado;
    }

    return guardarPersonaApi(valores, tipo, personaEditando).then(async (resultado) => {
      if (resultado.ok) {
        await recargar();
        setMensaje(personaEditando ? config.actualizado : config.registrado);
        volverALista();
      }
      return resultado;
    });
  }

  async function confirmarEliminacion() {
    try {
      if (!obtenerToken()) {
        borrarPersona(claveDe(personaEditando));
        setPersonas(listarPersonas(tipo));
        setMensaje(config.eliminado);
        volverALista();
        return;
      }
      await borrarPersonaApi(personaEditando);
      await recargar();
      setMensaje(config.eliminado);
      volverALista();
    } catch (errorEliminar) {
      setError(errorEliminar.message);
      setConfirmandoEliminar(false);
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="fw-bold mb-0">{config.plural}</h1>

        {vista === 'lista' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirFormularioNuevo}
          >
            {config.nuevo}
          </button>
        )}
      </div>

      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {vista === 'formulario' && (
        <>
          <section className="card shadow-sm mb-4">
            <div className="card-body">
              <h2 className="h4 mb-3">
                {personaEditando ? config.editar : config.nuevo}
              </h2>

              <FormularioPersona
                key={personaEditando ? claveDe(personaEditando) : 'nuevo'}
                tipo={tipo}
                personaInicial={personaEditando}
                onGuardar={manejarGuardado}
                onCancelar={volverALista}
              />
            </div>
          </section>

          {personaEditando && (
            <section className="card border-danger mb-4">
              <div className="card-body">
                <h2 className="h5 text-danger">Zona de eliminación</h2>

                {!confirmandoEliminar ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => setConfirmandoEliminar(true)}
                  >
                    {`Eliminar ${config.singular.toLowerCase()}`}
                  </button>
                ) : (
                  <div className="alert alert-warning mb-0" role="alert">
                    <p className="mb-2">
                      {`¿Eliminar al ${config.singular.toLowerCase()} "${nombreCompleto(
                        personaEditando
                      )}" (${claveDe(personaEditando)})? Esta acción no se puede deshacer.`}
                    </p>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={confirmarEliminacion}
                      >
                        Confirmar eliminación
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setConfirmandoEliminar(false)}
                      >
                        Cancelar eliminación
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {vista === 'lista' && (
        <>
          {tipo === 'empleado' && (
            <div className="mb-3 col-md-5 col-lg-4 px-0">
              <label htmlFor="filtro-empleados" className="form-label">
                Filtrar empleados
              </label>
              <select
                id="filtro-empleados"
                className="form-select"
                value={filtro}
                onChange={(evento) => setFiltro(evento.target.value)}
              >
                <option value="todos">Todos los empleados</option>
                <option value="Administrador">Administradores</option>
                <option value="Empleado">Empleados / Vendedores</option>
              </select>
            </div>
          )}

          <TablaPersonas
            personas={visibles}
            tipo={tipo}
            onEditar={abrirFormularioEdicion}
          />
        </>
      )}
    </>
  );
}

export default PersonasAdmin;