import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import App from '../../App.jsx';
import { authApi } from '../../api/authApi.js';
import { catalogoApi } from '../../api/catalogoApi.js';
import { ErrorApi, EVENTO_SESION_EXPIRADA } from '../../api/http.js';
import { guardarSesion, leerSesion } from '../../api/sesion.js';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import Login from './Login.jsx';
import RutaProtegida from './RutaProtegida.jsx';

const RESPUESTA_ADMIN = {
  token: 'jwt-admin',
  tipo: 'Bearer',
  expiraEnSegundos: 7200,
  usuario: {
    id: 1,
    nombre: 'Administrador',
    correo: 'admin@sonidovivo.cl',
    rol: 'ADMINISTRADOR',
    tipoUsuario: 'Administrador',
  },
};

const RESPUESTA_CLIENTE = {
  ...RESPUESTA_ADMIN,
  token: 'jwt-cliente',
  usuario: {
    id: 2,
    nombre: 'Ana',
    correo: 'ana@correo.cl',
    rol: 'CLIENTE',
    tipoUsuario: 'Cliente',
  },
};

function renderizarLogin(estadoInicial) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state: estadoInicial }]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<p>Pantalla del panel</p>} />
          <Route path="/admin/productos" element={<p>Panel de productos</p>} />
          <Route path="/" element={<p>Pantalla de la tienda</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

function completarLogin(correo, password) {
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: correo } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('Login', () => {
  it('muestra el formulario', () => {
    renderizarLogin();

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(screen.getByLabelText('Correo')).toBeTruthy();
    expect(screen.getByLabelText('Contraseña')).toBeTruthy();
  });

  it('valida que se ingresen correo y contraseña sin llamar al servidor', () => {
    spyOn(authApi, 'iniciarSesion');
    renderizarLogin();

    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(screen.getByText('El correo es obligatorio.')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria.')).toBeTruthy();
    expect(authApi.iniciarSesion).not.toHaveBeenCalled();
  });

  it('valida el formato del correo', () => {
    spyOn(authApi, 'iniciarSesion');
    renderizarLogin();

    completarLogin('no-es-correo', 'clave1');

    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy();
    expect(authApi.iniciarSesion).not.toHaveBeenCalled();
  });

  it('un empleado inicia sesión, se guarda el token y entra al panel', async () => {
    spyOn(authApi, 'iniciarSesion').and.resolveTo(RESPUESTA_ADMIN);
    renderizarLogin();

    completarLogin('  admin@sonidovivo.cl ', 'Admin1234');

    expect(await screen.findByText('Pantalla del panel')).toBeTruthy();
    expect(authApi.iniciarSesion).toHaveBeenCalledWith('admin@sonidovivo.cl', 'Admin1234');
    expect(leerSesion().token).toBe('jwt-admin');
  });

  it('un cliente inicia sesión y vuelve a la tienda', async () => {
    spyOn(authApi, 'iniciarSesion').and.resolveTo(RESPUESTA_CLIENTE);
    renderizarLogin();

    completarLogin('ana@correo.cl', 'clave1');

    expect(await screen.findByText('Pantalla de la tienda')).toBeTruthy();
  });

  it('después de iniciar sesión vuelve a la página que se quería abrir', async () => {
    spyOn(authApi, 'iniciarSesion').and.resolveTo(RESPUESTA_ADMIN);
    renderizarLogin({ desde: '/admin/productos' });

    completarLogin('admin@sonidovivo.cl', 'Admin1234');

    expect(await screen.findByText('Panel de productos')).toBeTruthy();
  });

  it('muestra el mensaje del servidor si las credenciales son incorrectas', async () => {
    spyOn(authApi, 'iniciarSesion').and.rejectWith(
      new ErrorApi('Correo o contraseña incorrectos', 401)
    );
    renderizarLogin();

    completarLogin('admin@sonidovivo.cl', 'mala');

    expect(await screen.findByText('Correo o contraseña incorrectos')).toBeTruthy();
    expect(leerSesion()).toBeNull();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
    // El botón vuelve a estar disponible para reintentar
    expect(screen.getByRole('button', { name: 'Ingresar' }).disabled).toBeFalse();
  });

  it('avisa si el servidor no responde', async () => {
    spyOn(authApi, 'iniciarSesion').and.rejectWith(
      new ErrorApi('No se pudo conectar con el servidor. Revisa que el backend esté en ejecución.')
    );
    renderizarLogin();

    completarLogin('admin@sonidovivo.cl', 'Admin1234');

    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeTruthy();
  });

  it('si ya hay una sesión abierta no muestra el login', () => {
    guardarSesion(RESPUESTA_ADMIN);

    renderizarLogin();

    expect(screen.getByText('Pantalla del panel')).toBeTruthy();
  });
});

describe('AuthProvider', () => {
  function Consumidor() {
    const { usuario, iniciarSesion, cerrarSesion } = useAuth();

    return (
      <>
        <p data-testid="quien">{usuario ? usuario.nombre : 'nadie'}</p>
        <button type="button" onClick={() => iniciarSesion('a@b.cl', 'x')}>
          entrar
        </button>
        <button type="button" onClick={cerrarSesion}>
          salir
        </button>
      </>
    );
  }

  const renderizar = () =>
    render(
      <AuthProvider>
        <Consumidor />
      </AuthProvider>
    );

  it('empieza sin usuario si no hay sesión guardada', () => {
    renderizar();

    expect(screen.getByTestId('quien').textContent).toBe('nadie');
  });

  it('recupera la sesión guardada al recargar la página', () => {
    guardarSesion(RESPUESTA_ADMIN);

    renderizar();

    expect(screen.getByTestId('quien').textContent).toBe('Administrador');
  });

  it('iniciarSesion guarda la sesión y cerrarSesion la borra', async () => {
    spyOn(authApi, 'iniciarSesion').and.resolveTo(RESPUESTA_ADMIN);
    renderizar();

    fireEvent.click(screen.getByRole('button', { name: 'entrar' }));
    await waitFor(() =>
      expect(screen.getByTestId('quien').textContent).toBe('Administrador')
    );
    expect(leerSesion().token).toBe('jwt-admin');

    fireEvent.click(screen.getByRole('button', { name: 'salir' }));

    expect(screen.getByTestId('quien').textContent).toBe('nadie');
    expect(leerSesion()).toBeNull();
  });

  it('cierra la sesión cuando el backend avisa que el token venció', async () => {
    guardarSesion(RESPUESTA_ADMIN);
    renderizar();

    window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));

    await waitFor(() => expect(screen.getByTestId('quien').textContent).toBe('nadie'));
  });

  it('useAuth sin proveedor devuelve "sin sesión" y no permite iniciar', async () => {
    let contexto;

    function Espia() {
      contexto = useAuth();

      return null;
    }

    render(<Espia />);

    expect(contexto.usuario).toBeNull();
    await expectAsync(contexto.iniciarSesion('a@b.cl', 'x')).toBeRejectedWithError(
      /AuthProvider/
    );
    expect(() => contexto.cerrarSesion()).not.toThrow();
  });
});

describe('RutaProtegida', () => {
  function renderizar(rutaInicial, rolesPermitidos) {
    return render(
      <MemoryRouter initialEntries={[rutaInicial]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<p>Pantalla de login</p>} />
            <Route path="/" element={<p>Inicio de la tienda</p>} />
            <Route element={<RutaProtegida rolesPermitidos={rolesPermitidos} />}>
              <Route path="/secreto" element={<p>Contenido protegido</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  it('sin sesión lleva al login', () => {
    renderizar('/secreto');

    expect(screen.getByText('Pantalla de login')).toBeTruthy();
    expect(screen.queryByText('Contenido protegido')).toBeNull();
  });

  it('con un rol permitido muestra el contenido', () => {
    guardarSesion(RESPUESTA_ADMIN);

    renderizar('/secreto');

    expect(screen.getByText('Contenido protegido')).toBeTruthy();
  });

  it('con un rol no permitido muestra "Acceso denegado" y un enlace a la tienda', () => {
    guardarSesion(RESPUESTA_CLIENTE);

    renderizar('/secreto');

    expect(screen.getByRole('heading', { name: 'Acceso denegado' })).toBeTruthy();
    expect(screen.queryByText('Contenido protegido')).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Volver a la tienda' }).getAttribute('href')
    ).toBe('/');
  });

  it('acepta una lista de roles propia', () => {
    guardarSesion(RESPUESTA_CLIENTE);

    renderizar('/secreto', ['CLIENTE']);

    expect(screen.getByText('Contenido protegido')).toBeTruthy();
  });
});

describe('Tienda: acceso desde la barra superior', () => {
  function renderizarTienda() {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
  }

  beforeEach(() => {
    spyOn(catalogoApi, 'listar').and.resolveTo([]);
  });

  it('sin sesión ofrece "Ingresar"', async () => {
    renderizarTienda();

    expect(
      (await screen.findByRole('link', { name: 'Ingresar' })).getAttribute('href')
    ).toBe('/login');
    expect(screen.queryByRole('button', { name: 'Salir' })).toBeNull();
  });

  it('un empleado ve el enlace a la administración y puede salir', async () => {
    guardarSesion(RESPUESTA_ADMIN);
    renderizarTienda();

    expect(
      (await screen.findByRole('link', { name: 'Administración' })).getAttribute('href')
    ).toBe('/admin');

    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));

    expect(await screen.findByRole('link', { name: 'Ingresar' })).toBeTruthy();
    expect(leerSesion()).toBeNull();
  });

  it('un cliente puede salir pero no ve el enlace a la administración', async () => {
    guardarSesion(RESPUESTA_CLIENTE);
    renderizarTienda();

    expect(await screen.findByRole('button', { name: 'Salir' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Administración' })).toBeNull();
  });
});
