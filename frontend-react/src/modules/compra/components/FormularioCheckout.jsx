import { useState } from 'react';
import {
  COSTOS_ENTREGA,
  formatoPrecio,
  validarDatosEnvio,
} from '../services/compraService.js';

function FormularioCheckout({ onConfirmar, onEntregaChange }) {
  const [direccion, setDireccion] = useState('');
  const [comuna, setComuna] = useState('');
  const [entrega, setEntrega] = useState('estandar');
  const [errores, setErrores] = useState({});

  function cambiarEntrega(valor) {
    setEntrega(valor);

    if (onEntregaChange) {
      onEntregaChange(valor);
    }
  }

  function manejarEnvio(evento) {
    evento.preventDefault();

    const erroresEncontrados = validarDatosEnvio({ direccion, comuna });
    setErrores(erroresEncontrados);

    if (Object.keys(erroresEncontrados).length > 0) {
      return;
    }

    onConfirmar({
      direccion: direccion.trim(),
      comuna: comuna.trim(),
      entrega,
    });
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h4 mb-3">Datos de entrega</h2>

        <form onSubmit={manejarEnvio} noValidate>
          <div className="mb-3">
            <label htmlFor="direccion" className="form-label">
              Dirección de envío
            </label>
            <input
              id="direccion"
              className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
              value={direccion}
              onChange={(evento) => setDireccion(evento.target.value)}
              placeholder="Calle, número y departamento"
            />
            {errores.direccion && (
              <div className="invalid-feedback">{errores.direccion}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="comuna" className="form-label">
              Comuna
            </label>
            <input
              id="comuna"
              className={`form-control ${errores.comuna ? 'is-invalid' : ''}`}
              value={comuna}
              onChange={(evento) => setComuna(evento.target.value)}
              placeholder="Ingresa tu comuna"
            />
            {errores.comuna && (
              <div className="invalid-feedback">{errores.comuna}</div>
            )}
          </div>

          <fieldset className="mb-4">
            <legend className="form-label">Método de entrega</legend>

            <div className="form-check mb-2">
              <input
                id="estandar"
                className="form-check-input"
                type="radio"
                name="entrega"
                value="estandar"
                checked={entrega === 'estandar'}
                onChange={(evento) => cambiarEntrega(evento.target.value)}
              />
              <label htmlFor="estandar" className="form-check-label">
                Estándar — {formatoPrecio(COSTOS_ENTREGA.estandar)}
              </label>
            </div>

            <div className="form-check">
              <input
                id="express"
                className="form-check-input"
                type="radio"
                name="entrega"
                value="express"
                checked={entrega === 'express'}
                onChange={(evento) => cambiarEntrega(evento.target.value)}
              />
              <label htmlFor="express" className="form-check-label">
                Express — {formatoPrecio(COSTOS_ENTREGA.express)}
              </label>
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary">
            Confirmar compra
          </button>
        </form>
      </div>
    </div>
  );
}

export default FormularioCheckout;
