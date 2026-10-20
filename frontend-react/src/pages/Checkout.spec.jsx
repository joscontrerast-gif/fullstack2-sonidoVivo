import React from 'react';
import {render,screen,cleanup,fireEvent,} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Checkout from './Checkout.jsx';
import CompraExitosa from '../modules/compra/pages/CompraExitosa.jsx';

const productoPrueba = {
  codigo: 'GTR001',
  nombre: 'Guitarra eléctrica',
  marca: 'Fender',
  modelo: 'Stratocaster',
  categoria: 'Guitarras',
  descripcion: 'Guitarra para pruebas',
  precio: 650000,
  stock: 5,
};

function renderizarCheckout() {
  return render(
    <MemoryRouter>
      <Checkout />
    </MemoryRouter>
  );
}

function prepararCarrito(cantidad = 2) {
  localStorage.setItem(
    'carritoSonidoVivo',
    JSON.stringify([
      { codigo: 'GTR001', cantidad },
    ])
  );
}

describe('Checkout de Sonido Vivo', () => {
  let fetchSpy;

  beforeEach(() => {
    localStorage.clear();
    prepararCarrito();

    fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([productoPrueba]),
      })
    );
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('muestra el formulario y el resumen del pedido', async () => {
    renderizarCheckout();

    expect(
      await screen.findByRole('heading', {
        name: 'Finalizar compra',
      })
    ).toBeTruthy();

    expect(screen.getByLabelText('Dirección de envío')).toBeTruthy();
    expect(screen.getByLabelText('Comuna')).toBeTruthy();
    expect(screen.getByRole('button', {
      name: 'Confirmar compra',
    })).toBeTruthy();

    expect(screen.getByText('Guitarra eléctrica × 2')).toBeTruthy();
  });

  it('calcula correctamente el subtotal y el total con envío estándar', async () => {
    renderizarCheckout();

    await screen.findByText('Guitarra eléctrica × 2');

    const subtotal = screen.getByText('Subtotal').parentElement;
    const envio = screen.getByText('Envío').parentElement;
    const total = screen.getByText('Total').parentElement;

    expect(subtotal.textContent).toContain('$1.300.000');
    expect(envio.textContent).toContain('$1.990');
    expect(total.textContent).toContain('$1.301.990');
  });

  it('actualiza el costo de envío y el total al elegir entrega express', async () => {
    renderizarCheckout();

    await screen.findByText('Guitarra eléctrica × 2');

    fireEvent.click(screen.getByLabelText(/Express/));

    const envio = screen.getByText('Envío').parentElement;
    const total = screen.getByText('Total').parentElement;

    expect(envio.textContent).toContain('$4.990');
    expect(total.textContent).toContain('$1.304.990');
  });

  it('muestra un mensaje si el carrito está vacío', async () => {
    localStorage.removeItem('carritoSonidoVivo');

    renderizarCheckout();

    expect(
      await screen.findByRole('heading', {
        name: 'Finalizar compra',
      })
    ).toBeTruthy();

    expect(
      screen.getByText('Tu carrito está vacío.')
    ).toBeTruthy();

    expect(
      screen.getByRole('link', {
        name: 'Volver al catálogo',
      })
    ).toBeTruthy();
  });

  it('muestra un error cuando no se pueden cargar los productos', async () => {
    fetchSpy.and.returnValue(
      Promise.reject(new Error('Error de prueba'))
    );

    renderizarCheckout();

    expect(
      await screen.findByText('No se pudieron cargar los productos.')
    ).toBeTruthy();
  });

  it('rechaza una compra si la cantidad supera el stock', async () => {
    prepararCarrito(6);

    renderizarCheckout();

    await screen.findByText('Guitarra eléctrica × 6');

    fireEvent.change(screen.getByLabelText('Dirección de envío'), {
      target: { value: 'Avenida Central 123' },
    });

    fireEvent.change(screen.getByLabelText('Comuna'), {
      target: { value: 'Concón' },
    });

    fireEvent.submit(document.querySelector('form'));

    const alerta = await screen.findByRole('alert');

    expect(alerta.textContent).toContain(
        'La cantidad de Guitarra eléctrica supera el stock disponible.'
    );

    expect(
      localStorage.getItem('carritoSonidoVivo')
    ).not.toBeNull();
  });

  it('confirma la compra, vacía el carrito y muestra la página de éxito', async () => {
    render(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra-exitosa" element={<CompraExitosa />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText('Guitarra eléctrica × 2');

    fireEvent.change(screen.getByLabelText('Dirección de envío'), {
      target: { value: 'Avenida Central 123' },
    });

    fireEvent.change(screen.getByLabelText('Comuna'), {
      target: { value: 'Concón' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirmar compra',
      })
    );

    expect(
      await screen.findByRole('heading', {
        name: '¡Compra confirmada!',
      })
    ).toBeTruthy();

    expect(screen.getByText('Avenida Central 123')).toBeTruthy();
    expect(screen.getByText('Concón')).toBeTruthy();
    expect(screen.getByText('Entrega estándar')).toBeTruthy();

    expect(
      localStorage.getItem('carritoSonidoVivo')
    ).toBeNull();

    expect(
      screen.getByRole('link', {
        name: 'Volver a la tienda',
      })
    ).toBeTruthy();
  });

  it('muestra errores de validación y no avanza si el formulario está vacío', async () => {
    renderizarCheckout();

    await screen.findByText('Guitarra eléctrica × 2');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirmar compra',
      })
    );

    expect(screen.getByText(/dirección de al menos 5/)).toBeTruthy();
    expect(screen.getByText(/comuna de al menos 3/)).toBeTruthy();
    expect(localStorage.getItem('carritoSonidoVivo')).not.toBeNull();
  });
});
