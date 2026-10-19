import { useState } from 'react';
import { codigoDe } from '../../../data/productos.js';
import { LIMITES } from '../services/adminService.js';

const VALORES_VACIOS = {
  codigo: '',
  nombre: '',
  marca: '',
  modelo: '',
  descripcion: '',
  categoria: '',
  precio: '',
  stock: '',
  stockCritico: '',
};

function desdeProducto(producto) {
  if (!producto) {
    return VALORES_VACIOS;
  }

  return {
    codigo: codigoDe(producto),
    nombre: producto.nombre ?? '',
    marca: producto.marca ?? '',
    modelo: producto.modelo ?? '',
    descripcion: producto.descripcion ?? '',
    categoria: producto.categoria ?? '',
    precio: String(producto.precio ?? ''),
    stock: String(producto.stock ?? ''),
    stockCritico: String(producto.stockCritico ?? ''),
  };
}

function Campo({ id, etiqueta, error, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold">
        {etiqueta}
      </label>
      {children}
      {error && (
        <div id={`${id}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Formulario de creación / edición de productos.
 * - productoInicial: null para crear, el producto para editar.
 * - onGuardar(valores): debe devolver { ok, errores } (ver guardarProducto).
 */
function FormularioProducto({
  productoInicial = null,
  categorias,
  onGuardar,
  onCancelar,
}) {
  const modoEdicion = Boolean(productoInicial);
  const [valores, setValores] = useState(() => desdeProducto(productoInicial));
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setValores((anteriores) => ({ ...anteriores, [name]: value }));
    setErrores((anteriores) => ({ ...anteriores, [name]: undefined }));
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
      setErrorGeneral(error.message || 'No se pudo guardar el producto.');
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

  return (
    <form onSubmit={manejarEnvio} noValidate>
      {errorGeneral && (
        <div className="alert alert-danger" role="alert">
          {errorGeneral}
        </div>
      )}

      <div className="row">
        <div className="col-md-4">
          <Campo id="codigo" etiqueta="Código *" error={errores.codigo}>
            <input
              {...propsCampo('codigo')}
              type="text"
              placeholder="Ej: GA001"
              maxLength={LIMITES.codigoMax}
              readOnly={modoEdicion}
              required
            />
          </Campo>
        </div>

        <div className="col-md-8">
          <Campo id="nombre" etiqueta="Nombre *" error={errores.nombre}>
            <input
              {...propsCampo('nombre')}
              type="text"
              placeholder="Ej: Guitarra Acústica Folk"
              required
            />
          </Campo>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Campo id="marca" etiqueta="Marca" error={errores.marca}>
            <input {...propsCampo('marca')} type="text" placeholder="Ej: Yamaha" />
          </Campo>
        </div>

        <div className="col-md-6">
          <Campo id="modelo" etiqueta="Modelo" error={errores.modelo}>
            <input {...propsCampo('modelo')} type="text" placeholder="Ej: F310" />
          </Campo>
        </div>
      </div>

      <Campo
        id="descripcion"
        etiqueta="Descripción"
        error={errores.descripcion}
      >
        <textarea
          {...propsCampo('descripcion')}
          rows={4}
          placeholder={`Opcional. Máximo ${LIMITES.descripcion} caracteres.`}
        />
      </Campo>

      <div className="row">
        <div className="col-md-6">
          <Campo id="categoria" etiqueta="Categoría *" error={errores.categoria}>
            <select
              {...propsCampo('categoria')}
              className={`form-select${errores.categoria ? ' is-invalid' : ''}`}
              required
            >
              <option value="">-- Seleccionar categoría --</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </Campo>
        </div>

        <div className="col-md-6">
          <Campo id="precio" etiqueta="Precio (CLP) *" error={errores.precio}>
            <input
              {...propsCampo('precio')}
              type="number"
              min="0"
              step="any"
              placeholder="0 (gratis) o superior"
              required
            />
          </Campo>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <Campo id="stock" etiqueta="Stock *" error={errores.stock}>
            <input
              {...propsCampo('stock')}
              type="number"
              min="0"
              step="1"
              placeholder="Ej: 10"
              required
            />
          </Campo>
        </div>

        <div className="col-md-6">
          <Campo
            id="stockCritico"
            etiqueta="Stock crítico"
            error={errores.stockCritico}
          >
            <input
              {...propsCampo('stockCritico')}
              type="number"
              min="0"
              step="1"
              placeholder="Ej: 2 (opcional)"
            />
          </Campo>
        </div>
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={guardando}>
          {modoEdicion ? 'Guardar cambios' : 'Crear producto'}
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

export default FormularioProducto;
