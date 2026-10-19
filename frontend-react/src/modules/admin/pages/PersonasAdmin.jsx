import { useState } from 'react';
import { claveDe } from '../../../data/usuarios.js';
import FormularioPersona from '../components/FormularioPersona.jsx';
import TablaPersonas from '../components/TablaPersonas.jsx';
import {
  CONFIG_PERSONAS,
  borrarPersona,
  filtrarEmpleados,
  guardarPersona,
  listarPersonas,
  nombreCompleto,
} from '../services/personasService.js';

/**
 * Administración de clientes o empleados (tipo = 'cliente' | 'empleado').
 * Ambos usan la misma pantalla: lista, formulario de alta / edición
 * y eliminación con confirmación.
 */
function PersonasAdmin({ tipo }) {
  const config = CONFIG_PERSONAS[tipo];

  const [personas, setPersonas] = useState(() => listarPersonas(tipo));
  const [vista, setVista] = useState('lista'); // 'lista' | 'formulario'
  const [personaEditando, setPersonaEditando] = useState(null);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const visibles =
    tipo === 'empleado' ? filtrarEmpleados(personas, filtro) : personas;

  function recargar() {
    setPersonas(listarPersonas(tipo));
  }

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
    const claveOriginal = personaEditando ? claveDe(personaEditando) : null;
    const resultado = guardarPersona(valores, tipo, claveOriginal);

    if (resultado.ok) {
      recargar();
      setMensaje(claveOriginal ? config.actualizado : config.registrado);
      volverALista();
    }

    return resultado;
  }

  function confirmarEliminacion() {
    try {
      borrarPersona(claveDe(personaEditando));
      recargar();
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
