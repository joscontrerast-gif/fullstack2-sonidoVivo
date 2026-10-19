import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  calcularSubtotal,
  calcularTotal,
  obtenerCostoEntrega,
  validarDatosEnvio,
  validarCarrito,
  confirmarCompra,
} from '../services/compraService.js';
import FormularioCheckout from '../components/FormularioCheckout.jsx';
import ResumenCompra from '../components/ResumenCompra.jsx';
import CompraExitosa from '../pages/CompraExitosa.jsx';
import CompraFallida from '../pages/CompraFallida.jsx';

const productosPrueba = [
  { codigo: 'GTR001', nombre: 'Guitarra eléctrica', precio: 650000, cantidad: 2, stock: 5 },
  { codigo: 'CBL001', nombre: 'Cable plug', precio: 8000, cantidad: 1, stock: 10 },
];

const datosValidos = { direccion: 'Av. Siempre Viva 742', comuna: 'Antofagasta', entrega: 'express' };

describe('Servicio de compra', () => {
  beforeEach(() => localStorage.clear());

  it('calcula el subtotal sumando precio por cantidad', () => {
    expect(calcularSubtotal(productosPrueba)).toBe(1308000);
  });

  it('devuelve subtotal 0 si no hay productos', () => {
    expect(calcularSubtotal([])).toBe(0);
  });

  it('devuelve el costo de entrega express', () => {
    expect(obtenerCostoEntrega('express')).toBe(4990);
  });

  it('usa el costo estándar si el tipo de entrega no existe', () => {
    expect(obtenerCostoEntrega('otro')).toBe(1990);
  });

  it('calcula el total sumando subtotal y envío', () => {
    expect(calcularTotal(productosPrueba, 'express')).toBe(1312990);
  });

  it('detecta dirección y comuna vacías', () => {
    const errores = validarDatosEnvio({ direccion: '', comuna: '' });

    expect(errores.direccion).toBeDefined();
    expect(errores.comuna).toBeDefined();
  });

  it('no devuelve errores con datos de envío válidos', () => {
    expect(validarDatosEnvio(datosValidos)).toEqual({});
  });

  it('rechaza un carrito vacío', () => {
    expect(validarCarrito([])).toBe('Tu carrito está vacío.');
  });

  it('rechaza cantidades que superan el stock', () => {
    const excedido = [{ ...productosPrueba[0], cantidad: 9 }];

    expect(validarCarrito(excedido)).toContain('supera el stock');
  });

  it('confirma la compra, devuelve el resumen y vacía el carrito', () => {
    localStorage.setItem('carritoSonidoVivo', JSON.stringify([{ codigo: 'GTR001', cantidad: 2 }]));

    const resultado = confirmarCompra(productosPrueba, datosValidos);

    expect(resultado.exito).toBeTrue();
    expect(resultado.resumen.total).toBe(1312990);
    expect(resultado.resumen.entrega).toBe('Entrega express');
    expect(localStorage.getItem('carritoSonidoVivo')).toBeNull();
  });

  it('no confirma la compra con datos inválidos y conserva el carrito', () => {
    localStorage.setItem('carritoSonidoVivo', JSON.stringify([{ codigo: 'GTR001', cantidad: 2 }]));

    const resultado = confirmarCompra(productosPrueba, { direccion: '', comuna: '', entrega: 'estandar' });

    expect(resultado.exito).toBeFalse();
    expect(resultado.errores.direccion).toBeDefined();
    expect(localStorage.getItem('carritoSonidoVivo')).not.toBeNull();
  });
});

describe('FormularioCheckout', () => {
  afterEach(() => cleanup());

  it('muestra errores y no llama a onConfirmar si los campos están vacíos', () => {
    const onConfirmar = jasmine.createSpy('onConfirmar');
    render(<FormularioCheckout onConfirmar={onConfirmar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    expect(screen.getByText(/dirección de al menos 5/)).toBeTruthy();
    expect(screen.getByText(/comuna de al menos 3/)).toBeTruthy();
    expect(onConfirmar).not.toHaveBeenCalled();
  });

  it('llama a onConfirmar con los datos limpios y la entrega elegida', () => {
    const onConfirmar = jasmine.createSpy('onConfirmar');
    render(<FormularioCheckout onConfirmar={onConfirmar} />);

    fireEvent.change(screen.getByLabelText('Dirección de envío'), { target: { value: '  Av. Siempre Viva 742  ' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Antofagasta' } });
    fireEvent.click(screen.getByLabelText(/Express/));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    expect(onConfirmar).toHaveBeenCalledWith({
      direccion: 'Av. Siempre Viva 742',
      comuna: 'Antofagasta',
      entrega: 'express',
    });
  });
});

describe('ResumenCompra', () => {
  afterEach(() => cleanup());

  it('muestra cada producto con su cantidad y los totales', () => {
    render(<ResumenCompra productos={productosPrueba} costoEntrega={1990} />);

    expect(screen.getByText('Guitarra eléctrica × 2')).toBeTruthy();
    expect(screen.getByText('Cable plug × 1')).toBeTruthy();
    expect(screen.getByText('Subtotal')).toBeTruthy();
    expect(screen.getByText('Total')).toBeTruthy();
  });
});

describe('Páginas de resultado de compra', () => {
  afterEach(() => cleanup());

  it('CompraExitosa avisa si se entra sin una compra reciente', () => {
    render(
      <MemoryRouter>
        <CompraExitosa />
      </MemoryRouter>
    );

    expect(screen.getByText('No hay una compra reciente para mostrar.')).toBeTruthy();
  });

  it('CompraExitosa muestra el resumen recibido por el state del router', () => {
    const compra = confirmarCompra(productosPrueba, datosValidos).resumen;

    render(
      <MemoryRouter initialEntries={[{ pathname: '/compra-exitosa', state: { compra } }]}>
        <CompraExitosa />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '¡Compra confirmada!' })).toBeTruthy();
    expect(screen.getByText('Guitarra eléctrica × 2')).toBeTruthy();
    expect(screen.getByText('Entrega express')).toBeTruthy();
  });

  it('CompraFallida muestra el motivo y permite volver al carrito', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/compra-fallida', state: { motivo: 'Pago rechazado.' } }]}>
        <CompraFallida />
      </MemoryRouter>
    );

    expect(screen.getByText('Pago rechazado.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Volver al carrito' }).getAttribute('href')).toBe('/carrito');
  });
});