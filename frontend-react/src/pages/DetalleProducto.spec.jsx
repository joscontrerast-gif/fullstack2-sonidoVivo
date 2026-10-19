import React from 'react';
import {
  render,
  screen,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DetalleProducto from './DetalleProducto.jsx';

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

function renderizarDetalle(codigo = 'GTR001') {
  return render(
    <MemoryRouter initialEntries={[`/productos/${codigo}`]}>
      <Routes>
        <Route
          path="/productos/:codigo"
          element={<DetalleProducto />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Detalle de producto', () => {
  let fetchSpy;

  beforeEach(() => {
    localStorage.clear();

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

  it('muestra los datos del producto', async () => {
    renderizarDetalle();

    expect(
      await screen.findByRole('heading', {
        name: 'Guitarra eléctrica',
      })
    ).toBeTruthy();

    expect(screen.getByText('Fender · Stratocaster')).toBeTruthy();
    expect(screen.getByText('Stock disponible: 5')).toBeTruthy();
  });

  it('muestra un mensaje si el producto no existe', async () => {
    renderizarDetalle('NOEXISTE');

    expect(
      await screen.findByRole('heading', {
        name: 'Producto no encontrado',
      })
    ).toBeTruthy();
  });

  it('muestra un mensaje cuando falla la carga', async () => {
    fetchSpy.and.returnValue(
      Promise.reject(new Error('Error de prueba'))
    );

    renderizarDetalle();

    expect(
      await screen.findByText('No se pudo cargar el producto.')
    ).toBeTruthy();
  });

  it('deshabilita el botón cuando no hay stock', async () => {
    fetchSpy.and.returnValue(
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { ...productoPrueba, stock: 0 },
          ]),
      })
    );

    renderizarDetalle();

    const boton = await screen.findByRole('button', {
      name: 'Sin stock',
    });

    expect(boton.disabled).toBeTrue();
    expect(screen.getByText('Sin stock disponible')).toBeTruthy();
  });

  it('agrega el producto al carrito', async () => {
    renderizarDetalle();

    const boton = await screen.findByRole('button', {
      name: 'Agregar al carrito',
    });

    fireEvent.click(boton);

    expect(
      await screen.findByText('¡Producto agregado al carrito!')
    ).toBeTruthy();

    expect(screen.getByRole('link', { name: 'Ver carrito' })).toBeTruthy();

    const carritoGuardado = JSON.parse(
      localStorage.getItem('carritoSonidoVivo')
    );

    expect(carritoGuardado).toEqual([
      { codigo: 'GTR001', cantidad: 1 },
    ]);
  });

  it('muestra un mensaje si no quedan unidades disponibles para agregar', async () => {
    localStorage.setItem(
      'carritoSonidoVivo',
      JSON.stringify([{ codigo: 'GTR001', cantidad: 5 }])
    );

    renderizarDetalle();

    const boton = await screen.findByRole('button', {
      name: 'Agregar al carrito',
    });

    fireEvent.click(boton);

    expect(
      await screen.findByText(
        'No hay más unidades disponibles para agregar.'
      )
    ).toBeTruthy();

    expect(
      screen.queryByRole('link', { name: 'Ver carrito' })
    ).toBeNull();
  });

  it('permite volver al catálogo', async () => {
    renderizarDetalle();

    expect(
      await screen.findByRole('link', {
        name: '← Volver al catálogo',
      })
    ).toBeTruthy();
  });
});