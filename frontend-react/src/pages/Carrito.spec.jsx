import React from 'react';
import {
  render,
  screen,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Carrito from './Carrito.jsx';

const productosPrueba = [
  {
    codigo: 'GTR001',
    nombre: 'Guitarra eléctrica',
    marca: 'Fender',
    modelo: 'Stratocaster',
    categoria: 'Guitarras',
    descripcion: 'Guitarra para pruebas',
    precio: 650000,
    stock: 5,
  },
  {
    codigo: 'BAT001',
    nombre: 'Batería acústica',
    marca: 'Yamaha',
    modelo: 'Stage Custom',
    categoria: 'Baterías',
    descripcion: 'Batería para pruebas',
    precio: 850000,
    stock: 2,
  },
];

function renderizarCarrito() {
  return render(
    <MemoryRouter>
      <Carrito />
    </MemoryRouter>
  );
}

function prepararCarrito(items = [{ codigo: 'GTR001', cantidad: 2 }]) {
  localStorage.setItem('carritoSonidoVivo', JSON.stringify(items));
}

describe('Carrito de Sonido Vivo', () => {
  let fetchSpy;

  beforeEach(() => {
    localStorage.clear();

    fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(productosPrueba),
      })
    );
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('muestra los productos guardados en el carrito', async () => {
    prepararCarrito();
    renderizarCarrito();

    expect(
      await screen.findByRole('heading', {
        name: 'Mi carrito',
      })
    ).toBeTruthy();

    expect(screen.getByRole('heading', {
      name: 'Guitarra eléctrica',
    })).toBeTruthy();

    expect(screen.getByText('Stock disponible: 5')).toBeTruthy();
    expect(screen.getByDisplayValue('2')).toBeTruthy();
  });

  it('calcula el subtotal y la cantidad total de productos', async () => {
    prepararCarrito([
      { codigo: 'GTR001', cantidad: 2 },
      { codigo: 'BAT001', cantidad: 1 },
    ]);

    renderizarCarrito();

    await screen.findByRole('heading', {
      name: 'Guitarra eléctrica',
    });

    expect(screen.getAllByText('$2.150.000').length).toBe(2);

    const cantidadTotal = screen.getByText('Productos').parentElement;
    expect(cantidadTotal.textContent).toContain('3');
  });

  it('permite cambiar la cantidad y actualiza el almacenamiento', async () => {
    prepararCarrito();
    renderizarCarrito();

    const campo = await screen.findByLabelText('Cantidad:');

    fireEvent.change(campo, {
      target: { value: '3' },
    });

    expect(screen.getByDisplayValue('3')).toBeTruthy();

    const carritoGuardado = JSON.parse(
      localStorage.getItem('carritoSonidoVivo')
    );

    expect(carritoGuardado).toEqual([
      { codigo: 'GTR001', cantidad: 3 },
    ]);
  });

  it('rechaza una cantidad superior al stock disponible', async () => {
    prepararCarrito();
    renderizarCarrito();

    const campo = await screen.findByLabelText('Cantidad:');

    fireEvent.change(campo, {
      target: { value: '6' },
    });

    expect(
      await screen.findByRole('status')
    ).toBeTruthy();

    expect(screen.getByRole('status').textContent).toContain(
      'La cantidad debe estar entre 1 y 5.'
    );

    const carritoGuardado = JSON.parse(
      localStorage.getItem('carritoSonidoVivo')
    );

    expect(carritoGuardado[0].cantidad).toBe(2);
  });

  it('permite eliminar un producto del carrito', async () => {
    prepararCarrito();
    renderizarCarrito();

    await screen.findByRole('heading', {
      name: 'Guitarra eléctrica',
    });

    fireEvent.click(screen.getByRole('button', {
      name: 'Eliminar',
    }));

    expect(
      await screen.findByRole('heading', {
        name: 'Tu carrito está vacío',
      })
    ).toBeTruthy();

    expect(screen.getByRole('status').textContent).toContain(
      'Producto eliminado del carrito.'
    );

    expect(
      JSON.parse(localStorage.getItem('carritoSonidoVivo'))
    ).toEqual([]);
  });

  it('permite vaciar todo el carrito', async () => {
    prepararCarrito([
      { codigo: 'GTR001', cantidad: 2 },
      { codigo: 'BAT001', cantidad: 1 },
    ]);

    renderizarCarrito();

    await screen.findByRole('heading', {
      name: 'Guitarra eléctrica',
    });

    fireEvent.click(screen.getByRole('button', {
      name: 'Vaciar carrito',
    }));

    expect(
      await screen.findByRole('heading', {
        name: 'Tu carrito está vacío',
      })
    ).toBeTruthy();

    expect(screen.getByRole('status').textContent).toContain(
      'El carrito se ha vaciado.'
    );

    expect(localStorage.getItem('carritoSonidoVivo')).toBeNull();
  });

  it('muestra un enlace para ir al catálogo cuando el carrito está vacío', async () => {
    localStorage.removeItem('carritoSonidoVivo');

    renderizarCarrito();

    expect(
      await screen.findByRole('heading', {
        name: 'Tu carrito está vacío',
      })
    ).toBeTruthy();

    expect(screen.getByRole('link', {
      name: 'Ir al catálogo',
    })).toBeTruthy();
  });

  it('impide continuar la compra cuando la cantidad supera el stock', async () => {
    prepararCarrito([{ codigo: 'GTR001', cantidad: 6 }]);

    renderizarCarrito();

    await screen.findByRole('heading', {
      name: 'Guitarra eléctrica',
    });

    const enlace = screen.getByRole('link', {
      name: 'Continuar compra',
    });

    expect(enlace.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(enlace);

    expect(screen.getByRole('status').textContent).toContain(
      'Corrige las cantidades según el stock disponible.'
    );
  });

  it('muestra un error si falla la carga del catálogo', async () => {
    fetchSpy.and.returnValue(
      Promise.reject(new Error('Error de prueba'))
    );

    prepararCarrito();
    renderizarCarrito();

    expect(
      await screen.findByRole('alert')
    ).toBeTruthy();

    expect(screen.getByRole('alert').textContent).toContain(
      'No se pudieron cargar los productos del catálogo.'
    );
  });
});