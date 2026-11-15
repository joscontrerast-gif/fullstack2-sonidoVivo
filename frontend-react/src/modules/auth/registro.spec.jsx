import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { authApi, ubicacionesApi } from '../../api/authApi.js';
import { ErrorApi } from '../../api/http.js';
import { guardarSesion, leerSesion } from '../../api/sesion.js';
import { AuthProvider } from './AuthContext.jsx';
import Registro, { validarRegistro } from './Registro.jsx';

const REGIONES = [
  { id: 1, nombre: 'Valparaíso' },
  { id: 2, nombre: 'Maule' },
];

const COMUNAS = [
  { id: 10, idRegion: 1, nombre: 'Viña del Mar' },
  { id: 11, idRegion: 1, nombre: 'Valparaíso' },
  { id: 20, idRegion: 2, nombre: 'Talca' },
];

// RUN válido: 12345678-5
const VALIDOS = {
  run: '12.345.678-5',
  nombre: 'María',
  apellidos: 'Pérez Díaz',
  correo: 'maria@duoc.cl',
  idRegion: '1',
  idComuna: '10',
  direccion: 'Av. España 123',
  contrasena: 'abcdef',
  confirmarContrasena: 'abcdef',
};

const ETIQUETAS = {
  run: 'RUN *',
  nombre: 'Nombre *',
  apellidos: 'Apellidos *',
  correo: 'Correo electrónico *',
  idRegion: 'Región *',
  idComuna: 'Comuna *',
  direccion: 'Dirección *',
  contrasena: 'Contraseña *',
  confirmarContrasena: 'Confirmar contraseña *',
};

function completar(valores) {
  Object.entries(valores).forEach(([campo, valor]) => {
    fireEvent.change(screen.getByLabelText(ETIQUETAS[campo]), {
      target: { value: valor },
    });
  });
}

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/registro']}>
      <AuthProvider>
        <Routes>
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<p>Pantalla de login</p>} />
          <Route path="/" element={<p>Pantalla de la tienda</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

const enviar = () => fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

describe('validarRegistro', () => {
  it('acepta datos válidos', () => {
    expect(validarRegistro(VALIDOS)).toEqual({});
  });

  it('exige todos los campos', () => {
    const errores = validarRegistro({
      run: '', nombre: '', apellidos: '', correo: '', idRegion: '',
      idComuna: '', direccion: '', contrasena: '', confirmarContrasena: '',
    });

    ['run', 'nombre', 'apellidos', 'correo', 'idRegion', 'idComuna', 'direccion', 'contrasena']
      .forEach((campo) => expect(errores[campo]).toBeDefined());
  });

  it('rechaza un RUN con dígito verificador incorrecto', () => {
    expect(validarRegistro({ ...VALIDOS, run: '12345678-9' }).run).toBe(
      'El RUN ingresado no es válido.'
    );
  });

  it('rechaza un correo de un dominio no permitido', () => {
    expect(validarRegistro({ ...VALIDOS, correo: 'maria@otro.com' }).correo).toMatch(
      /Solo se aceptan correos/
    );
  });

  it('rechaza contraseñas distintas', () => {
    expect(
      validarRegistro({ ...VALIDOS, confirmarContrasena: 'otra123' }).confirmarContrasena
    ).toBe('Las contraseñas no coinciden.');
  });
});

describe('Registro', () => {
  beforeEach(() => {
    spyOn(ubicacionesApi, 'regiones').and.resolveTo(REGIONES);
    spyOn(ubicacionesApi, 'comunas').and.resolveTo(COMUNAS);
  });

  it('carga las regiones desde el backend', async () => {
    renderizar();

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeTruthy();
    expect(await screen.findByRole('option', { name: 'Maule' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Valparaíso' })).toBeTruthy();
  });

  it('la comuna depende de la región elegida', async () => {
    renderizar();
    await screen.findByRole('option', { name: 'Maule' });

    expect(screen.getByLabelText('Comuna *').disabled).toBeTrue();

    fireEvent.change(screen.getByLabelText('Región *'), { target: { value: '1' } });

    expect(screen.getByRole('option', { name: 'Viña del Mar' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'Talca' })).toBeNull();

    fireEvent.change(screen.getByLabelText('Comuna *'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Región *'), { target: { value: '2' } });

    expect(screen.getByLabelText('Comuna *').value).toBe('');
    expect(screen.getByRole('option', { name: 'Talca' })).toBeTruthy();
  });

  it('avisa si no se pueden cargar las regiones', async () => {
    ubicacionesApi.regiones.and.rejectWith(new Error('No se pudo conectar con el servidor'));

    renderizar();

    expect(await screen.findByText('No se pudo conectar con el servidor')).toBeTruthy();
  });

  it('muestra los errores y no llama al servidor si faltan datos', async () => {
    spyOn(authApi, 'registrar');
    renderizar();
    await screen.findByRole('option', { name: 'Maule' });

    enviar();

    expect(await screen.findByText('El RUN es obligatorio.')).toBeTruthy();
    expect(screen.getByText('Debes seleccionar una región.')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria.')).toBeTruthy();
    expect(authApi.registrar).not.toHaveBeenCalled();
  });

  it('registra al cliente, inicia sesión y va a la tienda', async () => {
    spyOn(authApi, 'registrar').and.resolveTo({ id: 7 });
    spyOn(authApi, 'iniciarSesion').and.resolveTo({
      token: 'jwt',
      expiraEnSegundos: 3600,
      usuario: { id: 7, nombre: 'María', rol: 'CLIENTE', tipoUsuario: 'Cliente' },
    });
    renderizar();
    await screen.findByRole('option', { name: 'Maule' });

    completar(VALIDOS);
    enviar();

    expect(await screen.findByText('Pantalla de la tienda')).toBeTruthy();
    expect(authApi.registrar).toHaveBeenCalledWith({
      run: '123456785',
      nombre: 'María',
      apellidos: 'Pérez Díaz',
      correo: 'maria@duoc.cl',
      password: 'abcdef',
      idComuna: 10,
      direccion: 'Av. España 123',
    });
    expect(authApi.iniciarSesion).toHaveBeenCalledWith('maria@duoc.cl', 'abcdef');
    expect(leerSesion().token).toBe('jwt');
  });

  it('si la cuenta se crea pero el inicio de sesión falla, lleva al login', async () => {
    spyOn(authApi, 'registrar').and.resolveTo({ id: 7 });
    spyOn(authApi, 'iniciarSesion').and.rejectWith(new ErrorApi('fallo', 500));
    renderizar();
    await screen.findByRole('option', { name: 'Maule' });

    completar(VALIDOS);
    enviar();

    expect(await screen.findByText('Pantalla de login')).toBeTruthy();
  });

  it('muestra en el campo correo el conflicto del servidor', async () => {
    spyOn(authApi, 'registrar').and.rejectWith(
      new ErrorApi('Ya existe una cuenta con ese correo', 409)
    );
    renderizar();
    await screen.findByRole('option', { name: 'Maule' });

    completar(VALIDOS);
    enviar();

    expect(await screen.findByText('Ya existe una cuenta con ese correo')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeTruthy();
  });

  it('muestra en el campo RUN el conflicto de RUN del servidor', async () => {
    spyOn(authApi, 'registrar').and.rejectWith(
      new ErrorApi('Ya existe una cuenta con ese RUN', 409)
    );
    renderizar();
    await screen.findByRole('option', { name: 'Maule' });

    completar(VALIDOS);
    enviar();

    expect(await screen.findByText('Ya existe una cuenta con ese RUN')).toBeTruthy();
  });

  it('muestra los errores por campo que devuelve el servidor', async () => {
    spyOn(authApi, 'registrar').and.rejectWith(
      new ErrorApi('Hay datos que no son válidos', 400, {
        password: 'La contraseña debe tener entre 6 y 20 caracteres',
      })
    );
    renderizar();
    await screen.findByRole('option', { name: 'Maule' });

    completar(VALIDOS);
    enviar();

    expect(
      await screen.findByText('La contraseña debe tener entre 6 y 20 caracteres')
    ).toBeTruthy();
  });

  it('muestra un aviso general si no hay conexión', async () => {
    spyOn(authApi, 'registrar').and.rejectWith(
      new ErrorApi('No se pudo conectar con el servidor', 0)
    );
    renderizar();
    await screen.findByRole('option', { name: 'Maule' });

    completar(VALIDOS);
    enviar();

    expect(await screen.findByText('No se pudo conectar con el servidor')).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Crear cuenta' }).disabled).toBeFalse()
    );
  });

  it('si ya hay sesión abierta lleva a la tienda', () => {
    guardarSesion({
      token: 't',
      usuario: { id: 1, nombre: 'Ana', rol: 'CLIENTE', tipoUsuario: 'Cliente' },
    });

    renderizar();

    expect(screen.getByText('Pantalla de la tienda')).toBeTruthy();
  });
});
