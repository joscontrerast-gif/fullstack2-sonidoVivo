
import React from 'react';
import {
  render,
  screen,
  waitFor,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

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

function renderizarAplicacion() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
}

describe('Catálogo de Sonido Vivo', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = spyOn(window, 'fetch').and.returnValue(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(productosPrueba),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('muestra los productos después de cargarlos', async () => {
    renderizarAplicacion();

    expect(
      await screen.findByText('Guitarra eléctrica')
    ).toBeTruthy();

    expect(screen.getByText('Batería acústica')).toBeTruthy();
  });

  it('permite buscar productos por nombre', async () => {
    renderizarAplicacion();

    await screen.findByText('Guitarra eléctrica');

    fireEvent.change(screen.getByLabelText('Buscar productos'), {
      target: { value: 'guitarra' },
    });

    expect(screen.getByText('Guitarra eléctrica')).toBeTruthy();

    await waitFor(() => {
      expect(screen.queryByText('Batería acústica')).toBeNull();
    });
  });

  it('filtra los productos por categoría', async () => {
    renderizarAplicacion();

    await screen.findByText('Guitarra eléctrica');

    fireEvent.change(screen.getByLabelText('Filtrar por categoría'), {
      target: { value: 'Baterías' },
    });

    expect(screen.getByText('Batería acústica')).toBeTruthy();
    expect(screen.queryByText('Guitarra eléctrica')).toBeNull();
  });

  it('muestra un mensaje cuando no hay coincidencias', async () => {
    renderizarAplicacion();

    await screen.findByText('Guitarra eléctrica');

    fireEvent.change(screen.getByLabelText('Buscar productos'), {
      target: { value: 'producto inexistente' },
    });

    expect(
      await screen.findByText(
        'No se encontraron productos con esos criterios.'
      )
    ).toBeTruthy();
  });

  it('muestra un mensaje cuando falla la carga', async () => {
    fetchSpy.and.returnValue(
      Promise.reject(new Error('Error de prueba'))
    );

    renderizarAplicacion();

    expect(
      await screen.findByText(/No se pudieron cargar los productos/)
    ).toBeTruthy();
  });
});
