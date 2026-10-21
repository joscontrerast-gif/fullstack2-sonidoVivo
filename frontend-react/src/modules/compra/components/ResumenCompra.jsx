import { formatoPrecio, calcularSubtotal } from '../services/compraService.js';

function ResumenCompra({ productos, costoEntrega, titulo = 'Resumen del pedido' }) {
  const subtotal = calcularSubtotal(productos);
  const total = subtotal + costoEntrega;

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="h4">{titulo}</h2>

        {productos.map((producto) => (
          <div
            key={producto.codigo}
            className="d-flex justify-content-between gap-3 mb-3"
          >
            <span>
              {producto.nombre} × {producto.cantidad}
            </span>
            <strong>
              {formatoPrecio(Number(producto.precio) * producto.cantidad)}
            </strong>
          </div>
        ))}

        <hr />

        <p className="d-flex justify-content-between">
          <span>Subtotal</span>
          <strong>{formatoPrecio(subtotal)}</strong>
        </p>

        <p className="d-flex justify-content-between">
          <span>Envío</span>
          <strong>{formatoPrecio(costoEntrega)}</strong>
        </p>

        <hr />

        <p className="h4 d-flex justify-content-between">
          <span>Total</span>
          <span>{formatoPrecio(total)}</span>
        </p>
      </div>
    </div>
  );
}

export default ResumenCompra;
