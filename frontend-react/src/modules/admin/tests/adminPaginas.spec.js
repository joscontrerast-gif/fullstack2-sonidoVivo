import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../../../App.jsx';
import { dashboardApi, encargosApi, usuariosApi } from '../../../api/adminApi.js';
import { ErrorApi, EVENTO_SESION_EXPIRADA } from '../../../api/http.js';
import { borrarSesion, guardarSesion, leerSesion } from '../../../api/sesion.js';
import {
  instalarEncargosFalsos,
  instalarProductosFalsos,
  instalarUsuariosFalsos,
} from '../../../tests/baseFalsa.js';
import { AuthProvider } from '../../auth/AuthContext.jsx';
import DashboardAdmin from '../pages/DashboardAdmin.jsx';
import EncargosAdmin from '../pages/EncargosAdmin.jsx';
import PersonasAdmin from '../pages/PersonasAdmin.jsx';
import FormularioPersona from '../components/FormularioPersona.jsx';
import TablaEncargos from '../components/TablaEncargos.jsx';
import TablaPersonas from '../components/TablaPersonas.jsx';

// ---------------------------------------------------------------------------
// Datos de prueba
// ---------------------------------------------------------------------------

const ENCARGOS = [
  {
    id: 'ORD-001',
    fecha: '2026-03-10',
    cliente: 'Ana Torres',
    correo: 'ana@duoc.cl',
    total: 45990,
    estado: 'Pendiente',
  },
  {
    id: 'ORD-002',
    fecha: '2026-03-12',
    cliente: 'Juan Pérez',
    correo: 'juan@duoc.cl',
    total: 129900,
    estado: 'En Proceso',
    tipoEntrega: 'retiro',
  },
  {
    id: 'ORD-003',
    fecha: '2026-03-14',
    cliente: 'María Silva',
    total: 24990,
    estado: 'Completado',
  },
];

// RUN válidos: 12345678-5, 11111111-1, 7654321-6 y 9876543-3.
const USUARIOS = [
  {
    run: '123456785',
    nombre: 'Ana',
    apellidos: 'Torres',
    correo: 'ana@duoc.cl',
    tipoUsuario: 'Cliente',
    region: 'Valparaíso',
    comuna: 'Viña del Mar',
    direccion: 'Calle 1',
    password: 'secreta1',
    fechaRegistro: '2026-02-01',
    estado: 'Activo',
  },
  {
    run: '111111111',
    nombre: 'Luis',
    apellidos: 'Soto',
    correo: 'luis@gmail.com',
    tipoUsuario: 'Cliente',
    region: 'Maule',
    comuna: 'Talca',
    direccion: 'Calle 2',
    password: 'secreta2',
  },
  {
    run: '76543216',
    nombre: 'Vera',
    apellidos: 'Rojas',
    correo: 'vera@duoc.cl',
    tipoUsuario: 'Vendedor',
    rol: 'Vendedor',
    region: 'Valparaíso',
    comuna: 'Valparaíso',
    direccion: 'Calle 3',
    password: 'secreta3',
  },
  {
    run: '98765433',
    nombre: 'Carlos',
    apellidos: 'Silva',
    correo: 'carlos@profesor.duoc.cl',
    tipoUsuario: 'Administrador',
    rol: 'Administrador',
    region: 'Biobío',
    comuna: 'Concepción',
    direccion: 'Calle 4',
    password: 'secreta4',
  },
  // Usuario de demostración antiguo: sin RUN ni apellidos
  {
    nombre: 'Demo',
    correo: 'demo@duoc.cl',
    password: '1234',
    tipoUsuario: 'Empleado',
  },
];

// Las claves (region antes de comuna) respetan el orden en que se llenan.
const ETIQUETAS = {
  run: 'RUN *',
  nombre: 'Nombre *',
  apellidos: 'Apellidos *',
  correo: 'Correo electrónico *',
  rol: 'Rol / cargo *',
  region: 'Región *',
  comuna: 'Comuna *',
  direccion: 'Dirección *',
  contrasena: 'Contraseña *',
  confirmarContrasena: 'Confirmar contraseña *',
};

const CLIENTE_NUEVO = {
  run: '22.222.222-2',
  nombre: 'María',
  apellidos: 'Pérez Díaz',
  correo: 'maria@duoc.cl',
  region: 'Valparaíso',
  comuna: 'Valparaíso',
  direccion: 'Av. España 123',
  contrasena: 'abcdef',
  confirmarContrasena: 'abcdef',
};

function completar(valores, etiquetas = ETIQUETAS) {
  Object.entries(valores).forEach(([campo, valor]) => {
    fireEvent.change(screen.getByLabelText(etiquetas[campo]), {
      target: { value: valor },
    });
  });
}

function boton(nombre) {
  return screen.getByRole('button', { name: nombre });
}

// ---------------------------------------------------------------------------
// 1. Componentes
// ---------------------------------------------------------------------------

describe('TablaEncargos', () => {
  it('muestra una fila por encargo con el total formateado', () => {
    render(<TablaEncargos encargos={ENCARGOS} />);

    expect(screen.getAllByRole('row').length).toBe(4); // encabezado + 3
    expect(screen.getByText('ORD-002')).toBeTruthy();
    expect(screen.getByText('Juan Pérez')).toBeTruthy();
    expect(screen.getByText(/129\.900/)).toBeTruthy();
  });

  it('avisa el cambio de estado de un encargo', () => {
    const onCambiarEstado = jasmine.createSpy('onCambiarEstado');

    render(
      <TablaEncargos encargos={ENCARGOS} onCambiarEstado={onCambiarEstado} />
    );

    fireEvent.change(screen.getByLabelText('Estado de ORD-001'), {
      target: { value: 'Completado' },
    });

    expect(onCambiarEstado).toHaveBeenCalledWith('ORD-001', 'Completado');
  });

  it('avisa qué encargo se quiere ver en detalle', () => {
    const onVerDetalle = jasmine.createSpy('onVerDetalle');

    render(<TablaEncargos encargos={ENCARGOS} onVerDetalle={onVerDetalle} />);

    fireEvent.click(boton('Ver detalle ORD-002'));

    expect(onVerDetalle).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 'ORD-002' })
    );
  });

  it('en modo solo lectura no hay selectores ni botones', () => {
    render(<TablaEncargos encargos={[ENCARGOS[0]]} soloLectura />);

    expect(screen.getByText('Pendiente')).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'Acciones' })).toBeNull();
  });

  it('muestra un mensaje cuando no hay encargos', () => {
    render(<TablaEncargos encargos={[]} textoVacio="Sin pedidos." />);

    expect(screen.getByText('Sin pedidos.')).toBeTruthy();
  });
});

describe('TablaPersonas', () => {
  it('muestra una fila por persona con su ID, nombre completo y estado', () => {
    render(
      <TablaPersonas
        personas={USUARIOS.slice(0, 2)}
        tipo="cliente"
        onEditar={() => {}}
      />
    );

    expect(screen.getAllByRole('row').length).toBe(3);
    expect(screen.getByText('U0001')).toBeTruthy();
    expect(screen.getByText('U0002')).toBeTruthy();
    expect(screen.getByText('Ana Torres')).toBeTruthy();
    expect(screen.getByText('2026-02-01')).toBeTruthy();
    expect(screen.getAllByText('Activo').length).toBe(2);
    expect(screen.getByText('—')).toBeTruthy(); // Luis no tiene fecha
  });

  it('el encabezado dice Rol para empleados y Tipo para clientes', () => {
    const { unmount } = render(
      <TablaPersonas personas={[USUARIOS[2]]} tipo="empleado" onEditar={() => {}} />
    );

    expect(screen.getByRole('columnheader', { name: 'Rol' })).toBeTruthy();

    unmount();
    render(
      <TablaPersonas personas={[USUARIOS[0]]} tipo="cliente" onEditar={() => {}} />
    );

    expect(screen.getByRole('columnheader', { name: 'Tipo' })).toBeTruthy();
  });

  it('avisa a quién se quiere editar, incluso a un usuario sin RUN', () => {
    const onEditar = jasmine.createSpy('onEditar');

    render(
      <TablaPersonas
        personas={[USUARIOS[0], USUARIOS[4]]}
        tipo="empleado"
        onEditar={onEditar}
      />
    );

    fireEvent.click(boton('Editar demo@duoc.cl'));

    expect(onEditar).toHaveBeenCalledWith(
      jasmine.objectContaining({ nombre: 'Demo' })
    );
    expect(boton('Editar 123456785')).toBeTruthy();
  });

  it('muestra el mensaje de vacío según el tipo', () => {
    const { unmount } = render(
      <TablaPersonas personas={[]} tipo="cliente" onEditar={() => {}} />
    );

    expect(
      screen.getByText('No hay clientes registrados en el sistema.')
    ).toBeTruthy();

    unmount();
    render(<TablaPersonas personas={[]} tipo="empleado" onEditar={() => {}} />);

    expect(
      screen.getByText('No se encontraron empleados registrados.')
    ).toBeTruthy();
  });
});

describe('FormularioPersona', () => {
  function renderizar(props = {}) {
    const onGuardar =
      props.onGuardar ||
      jasmine
        .createSpy('onGuardar')
        .and.callFake(() => Promise.resolve({ ok: true, errores: {} }));
    const onCancelar = props.onCancelar || jasmine.createSpy('onCancelar');

    render(
      <FormularioPersona
        tipo={props.tipo || 'cliente'}
        personaInicial={props.personaInicial}
        onGuardar={onGuardar}
        onCancelar={onCancelar}
      />
    );

    return { onGuardar, onCancelar };
  }

  it('el campo rol aparece solo en el formulario de empleados', () => {
    renderizar({ tipo: 'cliente' });
    expect(screen.queryByLabelText('Rol / cargo *')).toBeNull();
  });

  it('el formulario de empleados incluye el rol con sus dos opciones', () => {
    renderizar({ tipo: 'empleado' });

    expect(screen.getByRole('option', { name: 'Vendedor' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Administrador' })).toBeTruthy();
  });

  it('la comuna se habilita al elegir región y muestra sus comunas', () => {
    renderizar();

    expect(screen.getByLabelText('Comuna *').disabled).toBeTrue();

    completar({ region: 'Valparaíso' });

    expect(screen.getByLabelText('Comuna *').disabled).toBeFalse();
    expect(screen.getByRole('option', { name: 'Viña del Mar' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'Talca' })).toBeNull();
  });

  it('al cambiar de región se borra la comuna elegida', () => {
    renderizar();

    completar({ region: 'Valparaíso', comuna: 'Viña del Mar' });
    expect(screen.getByLabelText('Comuna *').value).toBe('Viña del Mar');

    completar({ region: 'Maule' });
    expect(screen.getByLabelText('Comuna *').value).toBe('');
  });

  it('envía los valores escritos al guardar', async () => {
    const { onGuardar } = renderizar();

    completar(CLIENTE_NUEVO);
    fireEvent.click(boton('Guardar'));

    await waitFor(() =>
      expect(onGuardar).toHaveBeenCalledWith(
        jasmine.objectContaining({
          run: '22.222.222-2',
          nombre: 'María',
          region: 'Valparaíso',
          comuna: 'Valparaíso',
          contrasena: 'abcdef',
        })
      )
    );
  });

  it('muestra los errores que recibe y marca el campo', async () => {
    renderizar({
      onGuardar: () =>
        Promise.resolve({ ok: false, errores: { nombre: 'Nombre de prueba inválido' } }),
    });

    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('Nombre de prueba inválido')).toBeTruthy();
    expect(screen.getByLabelText('Nombre *').getAttribute('aria-invalid')).toBe('true');
  });

  it('quita el error de un campo cuando el usuario lo corrige', async () => {
    renderizar({
      onGuardar: () =>
        Promise.resolve({ ok: false, errores: { nombre: 'Nombre de prueba inválido' } }),
    });

    fireEvent.click(boton('Guardar'));
    await screen.findByText('Nombre de prueba inválido');

    completar({ nombre: 'Corregido' });

    expect(screen.queryByText('Nombre de prueba inválido')).toBeNull();
  });

  it('muestra un error general si guardar falla', async () => {
    renderizar({
      onGuardar: () => Promise.reject(new Error('Fallo de almacenamiento')),
    });

    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('Fallo de almacenamiento')).toBeTruthy();
  });

  it('en edición precarga los datos, bloquea el RUN y la contraseña es opcional', () => {
    renderizar({ personaInicial: USUARIOS[0] });

    expect(screen.getByLabelText('RUN *').value).toBe('123456785');
    expect(screen.getByLabelText('RUN *').readOnly).toBeTrue();
    expect(screen.getByLabelText('Nombre *').value).toBe('Ana');
    expect(screen.getByLabelText('Región *').value).toBe('Valparaíso');
    expect(screen.getByLabelText('Comuna *').value).toBe('Viña del Mar');
    expect(screen.getByLabelText('Nueva contraseña').value).toBe('');
    expect(screen.getByLabelText('Confirmar nueva contraseña')).toBeTruthy();
    expect(boton('Guardar cambios')).toBeTruthy();
  });

  it('conserva una región antigua que ya no está en la lista', () => {
    renderizar({
      personaInicial: { ...USUARIOS[0], region: 'Metropolitana', comuna: 'Santiago' },
    });

    expect(screen.getByLabelText('Región *').value).toBe('Metropolitana');
    expect(screen.getByLabelText('Comuna *').value).toBe('Santiago');
  });

  it('un empleado antiguo "Empleado" se precarga como Vendedor', () => {
    renderizar({ tipo: 'empleado', personaInicial: USUARIOS[4] });

    expect(screen.getByLabelText('Rol / cargo *').value).toBe('Vendedor');
    expect(screen.getByText(/no tiene RUN registrado/)).toBeTruthy();
  });

  it('el botón Cancelar avisa al componente padre', () => {
    const { onCancelar } = renderizar();

    fireEvent.click(boton('Cancelar'));

    expect(onCancelar).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 2. Páginas
// ---------------------------------------------------------------------------

describe('DashboardAdmin', () => {
  let bd;

  function renderizar() {
    return render(
      <MemoryRouter>
        <DashboardAdmin />
      </MemoryRouter>
    );
  }

  beforeEach(() => {
    bd = instalarEncargosFalsos(ENCARGOS);
  });

  it('muestra el resumen de encargos por estado', async () => {
    renderizar();

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(await screen.findByTestId('resumen-encargos-total')).toBeTruthy();
    expect(screen.getByTestId('resumen-encargos-total').textContent).toBe('3');
    expect(screen.getByTestId('resumen-encargos-Pendiente').textContent).toBe('1');
    expect(screen.getByTestId('resumen-encargos-En Proceso').textContent).toBe('1');
    expect(screen.getByTestId('resumen-encargos-Completado').textContent).toBe('1');
    expect(screen.getByTestId('resumen-encargos-Cancelado').textContent).toBe('0');
  });

  it('lista solo los pedidos pendientes', async () => {
    renderizar();

    expect(await screen.findByText('ORD-001')).toBeTruthy();
    expect(screen.queryByText('ORD-002')).toBeNull();
    expect(screen.queryByText('ORD-003')).toBeNull();
  });

  it('avisa cuando no hay pedidos pendientes', async () => {
    bd[0].estado = 'Completado';

    renderizar();

    expect(
      await screen.findByText('No hay pedidos pendientes actualmente.')
    ).toBeTruthy();
  });

  it('enlaza a la lista completa de encargos', async () => {
    renderizar();

    expect(
      (await screen.findByRole('link', { name: 'Ver todos los encargos' })).getAttribute('href')
    ).toBe('/admin/encargos');
  });

  it('informa el error si no se puede cargar el resumen', async () => {
    dashboardApi.resumen.and.rejectWith(new Error('No se pudo conectar con el servidor'));

    renderizar();

    expect(
      await screen.findByText('No se pudo conectar con el servidor')
    ).toBeTruthy();
  });
});

describe('EncargosAdmin', () => {
  let bd;

  beforeEach(() => {
    bd = instalarEncargosFalsos(ENCARGOS);
  });

  it('lista los encargos con los más recientes primero', async () => {
    render(<EncargosAdmin />);

    const filas = await screen.findAllByRole('row');

    expect(within(filas[1]).getByText('ORD-003')).toBeTruthy();
    expect(within(filas[3]).getByText('ORD-001')).toBeTruthy();
  });

  it('informa el error si no se pueden cargar los encargos', async () => {
    encargosApi.listar.and.rejectWith(new Error('No se pudo conectar con el servidor'));

    render(<EncargosAdmin />);

    expect(
      await screen.findByText('No se pudo conectar con el servidor')
    ).toBeTruthy();
  });

  it('filtra por estado', async () => {
    render(<EncargosAdmin />);

    fireEvent.change(await screen.findByLabelText('Filtrar por estado'), {
      target: { value: 'Pendiente' },
    });

    await waitFor(() =>
      expect(screen.queryByLabelText('Estado de ORD-002')).toBeNull()
    );
    expect(screen.getByLabelText('Estado de ORD-001')).toBeTruthy();
    expect(encargosApi.listar).toHaveBeenCalledWith('Pendiente');
  });

  it('avisa cuando ningún encargo tiene el estado elegido', async () => {
    render(<EncargosAdmin />);

    fireEvent.change(await screen.findByLabelText('Filtrar por estado'), {
      target: { value: 'Cancelado' },
    });

    expect(await screen.findByText('No hay encargos registrados.')).toBeTruthy();
  });

  it('cambia el estado de un encargo y lo guarda en el servidor', async () => {
    render(<EncargosAdmin />);

    fireEvent.change(await screen.findByLabelText('Estado de ORD-001'), {
      target: { value: 'Completado' },
    });

    expect(
      await screen.findByText('El estado del encargo ORD-001 fue actualizado a: Completado')
    ).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByLabelText('Estado de ORD-001').value).toBe('Completado')
    );
    expect(encargosApi.cambiarEstado).toHaveBeenCalledWith(1, 'Completado');
    expect(bd.find((e) => e.numeroOrden === 'ORD-001').estado).toBe('Completado');
  });

  it('muestra el error si el servidor rechaza el cambio y deja el estado anterior', async () => {
    encargosApi.cambiarEstado.and.rejectWith(
      new ErrorApi('Un encargo completado ya no puede cambiar de estado', 409)
    );
    render(<EncargosAdmin />);

    fireEvent.change(await screen.findByLabelText('Estado de ORD-003'), {
      target: { value: 'Pendiente' },
    });

    expect(
      await screen.findByText('Un encargo completado ya no puede cambiar de estado')
    ).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByLabelText('Estado de ORD-003').value).toBe('Completado')
    );
  });

  it('muestra el detalle de un encargo y se puede cerrar', async () => {
    render(<EncargosAdmin />);

    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle ORD-002' }));

    expect(
      screen.getByRole('heading', { name: 'Detalle de la orden ORD-002' })
    ).toBeTruthy();
    expect(screen.getByText('juan@duoc.cl')).toBeTruthy();
    expect(screen.getByText('Retiro en tienda')).toBeTruthy();

    fireEvent.click(boton('Cerrar detalle'));

    expect(
      screen.queryByRole('heading', { name: 'Detalle de la orden ORD-002' })
    ).toBeNull();
  });

  it('el detalle indica N/A si no hay correo y "No informado" si no hay entrega', async () => {
    render(<EncargosAdmin />);

    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle ORD-003' }));

    expect(screen.getByText('N/A')).toBeTruthy();
    expect(screen.getByText('No informado')).toBeTruthy();
  });
});

describe('PersonasAdmin - clientes', () => {
  let bd;

  const botonLista = (nombre) => screen.findByRole('button', { name: nombre });

  beforeEach(() => {
    bd = instalarUsuariosFalsos(USUARIOS);
  });

  it('lista solo a los clientes', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    expect(screen.getByRole('heading', { name: 'Clientes' })).toBeTruthy();
    expect(await screen.findByText('Ana Torres')).toBeTruthy();
    expect(screen.getByText('Luis Soto')).toBeTruthy();
    expect(screen.queryByText('Vera Rojas')).toBeNull();
  });

  it('avisa si no hay clientes', async () => {
    bd.length = 0;

    render(<PersonasAdmin tipo="cliente" />);

    expect(
      await screen.findByText('No hay clientes registrados en el sistema.')
    ).toBeTruthy();
  });

  it('informa el error si no se pueden cargar los clientes', async () => {
    usuariosApi.listar.and.rejectWith(new Error('No se pudo conectar con el servidor'));

    render(<PersonasAdmin tipo="cliente" />);

    expect(
      await screen.findByText('No se pudo conectar con el servidor')
    ).toBeTruthy();
  });

  it('crea un cliente desde el formulario', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Nuevo cliente'));
    completar(CLIENTE_NUEVO);
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('Cliente registrado con éxito.')).toBeTruthy();
    expect(await screen.findByText('María Pérez Díaz')).toBeTruthy();

    const guardado = bd.find((u) => u.run === '222222222');

    expect(guardado.tipo).toBe('Cliente');
    expect(usuariosApi.crear.calls.mostRecent().args[0].password).toBe('abcdef');
  });

  it('valida el formulario y no llama al servidor si faltan datos', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Nuevo cliente'));
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('El RUN es obligatorio.')).toBeTruthy();
    expect(screen.getByText('Debes seleccionar una región.')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nuevo cliente' })).toBeTruthy();
    expect(usuariosApi.crear).not.toHaveBeenCalled();
    expect(bd.length).toBe(5);
  });

  it('rechaza un RUN con dígito verificador incorrecto', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Nuevo cliente'));
    completar({ ...CLIENTE_NUEVO, run: '12345678-9' });
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('El RUN ingresado no es válido.')).toBeTruthy();
    expect(bd.length).toBe(5);
  });

  it('rechaza un RUN que ya está registrado', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Nuevo cliente'));
    completar({ ...CLIENTE_NUEVO, run: '12345678-5' });
    fireEvent.click(boton('Guardar'));

    expect(
      (await screen.findAllByText('El RUN o Correo ya se encuentra registrado.')).length
    ).toBe(2);
    expect(bd.length).toBe(5);
  });

  it('muestra el error del servidor cuando el correo ya existe allá', async () => {
    usuariosApi.crear.and.rejectWith(new ErrorApi('Ya existe un usuario con ese correo', 409));
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Nuevo cliente'));
    completar(CLIENTE_NUEVO);
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('Ya existe un usuario con ese correo')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nuevo cliente' })).toBeTruthy();
  });

  it('muestra un aviso si no hay conexión al guardar', async () => {
    usuariosApi.crear.and.rejectWith(new ErrorApi('No se pudo conectar con el servidor', 0));
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Nuevo cliente'));
    completar(CLIENTE_NUEVO);
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('No se pudo conectar con el servidor')).toBeTruthy();
  });

  it('edita un cliente sin enviar contraseña si no se escribe otra', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Editar 123456785'));

    expect(screen.getByRole('heading', { name: 'Editar cliente' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Nombre *'), {
      target: { value: 'Ana María' },
    });
    fireEvent.click(boton('Guardar cambios'));

    expect(await screen.findByText('Cliente actualizado con éxito.')).toBeTruthy();
    expect(await screen.findByText('Ana María Torres')).toBeTruthy();

    const [id, cuerpo] = usuariosApi.actualizar.calls.mostRecent().args;

    expect(id).toBe(1);
    expect(cuerpo.password).toBeUndefined();
    expect(cuerpo.run).toBe('123456785');
  });

  it('elimina un cliente solo después de confirmar', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Editar 123456785'));
    fireEvent.click(boton('Eliminar cliente'));

    expect(screen.getByText(/¿Eliminar al cliente/)).toBeTruthy();
    expect(bd.length).toBe(5);

    fireEvent.click(boton('Confirmar eliminación'));

    expect(await screen.findByText('Cliente eliminado correctamente.')).toBeTruthy();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Editar 123456785' })).toBeNull()
    );
    expect(usuariosApi.eliminar).toHaveBeenCalledWith(1);
    expect(bd.length).toBe(4);
  });

  it('muestra el error si el servidor no deja eliminar', async () => {
    usuariosApi.eliminar.and.rejectWith(new ErrorApi('No puedes eliminar tu propia cuenta', 409));
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Editar 123456785'));
    fireEvent.click(boton('Eliminar cliente'));
    fireEvent.click(boton('Confirmar eliminación'));

    expect(await screen.findByText('No puedes eliminar tu propia cuenta')).toBeTruthy();
    expect(bd.length).toBe(5);
  });

  it('no elimina nada si se cancela la confirmación', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Editar 123456785'));
    fireEvent.click(boton('Eliminar cliente'));
    fireEvent.click(boton('Cancelar eliminación'));

    expect(screen.queryByText(/¿Eliminar al cliente/)).toBeNull();
    expect(boton('Eliminar cliente')).toBeTruthy();
    expect(usuariosApi.eliminar).not.toHaveBeenCalled();
  });

  it('cancelar el formulario vuelve a la lista sin guardar', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(await botonLista('Nuevo cliente'));
    fireEvent.click(boton('Cancelar'));

    expect(boton('Nuevo cliente')).toBeTruthy();
    expect(usuariosApi.crear).not.toHaveBeenCalled();
  });
});

describe('PersonasAdmin - empleados', () => {
  let bd;

  const botonLista = (nombre) => screen.findByRole('button', { name: nombre });

  beforeEach(() => {
    bd = instalarUsuariosFalsos(USUARIOS);
  });

  it('lista solo a los empleados', async () => {
    render(<PersonasAdmin tipo="empleado" />);

    expect(screen.getByRole('heading', { name: 'Empleados' })).toBeTruthy();
    expect(await screen.findByText('Vera Rojas')).toBeTruthy();
    expect(screen.getByText('Carlos Silva')).toBeTruthy();
    expect(screen.getByText('Demo')).toBeTruthy();
    expect(screen.queryByText('Ana Torres')).toBeNull();
  });

  it('filtra entre administradores y empleados / vendedores', async () => {
    render(<PersonasAdmin tipo="empleado" />);

    await screen.findByText('Vera Rojas');
    fireEvent.change(screen.getByLabelText('Filtrar empleados'), {
      target: { value: 'Administrador' },
    });

    expect(screen.getByText('Carlos Silva')).toBeTruthy();
    expect(screen.queryByText('Vera Rojas')).toBeNull();

    fireEvent.change(screen.getByLabelText('Filtrar empleados'), {
      target: { value: 'Empleado' },
    });

    expect(screen.getByText('Vera Rojas')).toBeTruthy();
    expect(screen.getByText('Demo')).toBeTruthy();
    expect(screen.queryByText('Carlos Silva')).toBeNull();
  });

  it('crea un empleado con su rol', async () => {
    render(<PersonasAdmin tipo="empleado" />);

    fireEvent.click(await botonLista('Nuevo empleado'));
    completar({ ...CLIENTE_NUEVO, rol: 'Administrador' });
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('Empleado registrado con éxito.')).toBeTruthy();

    const guardado = bd.find((u) => u.run === '222222222');

    expect(guardado.tipo).toBe('Administrador');
  });

  it('exige elegir un rol', async () => {
    render(<PersonasAdmin tipo="empleado" />);

    fireEvent.click(await botonLista('Nuevo empleado'));
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('Debes seleccionar un rol o cargo.')).toBeTruthy();
    expect(usuariosApi.crear).not.toHaveBeenCalled();
  });

  it('edita a un empleado antiguo sin RUN conservando su correo', async () => {
    render(<PersonasAdmin tipo="empleado" />);

    fireEvent.click(await botonLista('Editar demo@duoc.cl'));
    completar(
      {
        apellidos: 'De Prueba',
        region: 'Biobío',
        comuna: 'Concepción',
        direccion: 'Calle 9',
      },
      ETIQUETAS
    );
    fireEvent.click(boton('Guardar cambios'));

    expect(await screen.findByText('Empleado actualizado con éxito.')).toBeTruthy();

    const demo = bd.find((u) => u.correo === 'demo@duoc.cl');

    expect(demo.apellidos).toBe('De Prueba');
    expect(demo.tipo).toBe('Vendedor');
  });

  it('elimina a un empleado después de confirmar', async () => {
    render(<PersonasAdmin tipo="empleado" />);

    fireEvent.click(await botonLista('Editar 76543216'));
    fireEvent.click(boton('Eliminar empleado'));

    expect(screen.getByText(/¿Eliminar al empleado/)).toBeTruthy();

    fireEvent.click(boton('Confirmar eliminación'));

    expect(await screen.findByText('Empleado eliminado correctamente.')).toBeTruthy();
    expect(bd.some((u) => u.run === '76543216')).toBeFalse();
  });
});

// ---------------------------------------------------------------------------
// 3. Rutas, menú y acceso al panel (con la aplicación completa)
// ---------------------------------------------------------------------------

describe('Rutas del panel administrativo', () => {
  const ADMINISTRADOR = {
    token: 'tok-admin',
    expiraEnSegundos: 3600,
    usuario: {
      id: 4,
      nombre: 'Carlos',
      correo: 'carlos@profesor.duoc.cl',
      rol: 'ADMINISTRADOR',
      tipoUsuario: 'Administrador',
    },
  };

  const conRol = (rol, tipoUsuario) => ({
    ...ADMINISTRADOR,
    usuario: { ...ADMINISTRADOR.usuario, rol, tipoUsuario },
  });

  function renderizar(ruta = '/admin') {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
  }

  const menu = () =>
    screen.getByRole('navigation', { name: 'Menú de administración' });

  beforeEach(() => {
    instalarEncargosFalsos(ENCARGOS);
    instalarUsuariosFalsos(USUARIOS);
    instalarProductosFalsos([
      {
        codigo: 'GTR001',
        categoria: 'Guitarras Eléctricas',
        nombre: 'Stratocaster',
        marca: 'Fender',
        stock: 5,
        precio: 650000,
      },
    ]);
    guardarSesion(ADMINISTRADOR);
  });

  it('/admin muestra el menú lateral y el dashboard', async () => {
    renderizar();

    ['Dashboard', 'Productos', 'Encargos', 'Clientes', 'Empleados'].forEach(
      (nombre) => {
        expect(within(menu()).getByRole('link', { name: nombre })).toBeTruthy();
      }
    );
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(
      within(menu()).getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')
    ).toBe('page');
    await screen.findByTestId('resumen-encargos-total');
  });

  it('muestra el nombre y el tipo del usuario conectado', async () => {
    renderizar();

    expect(await screen.findByText(/Carlos · Administrador/)).toBeTruthy();
  });

  it('el menú lleva a cada sección y marca la activa', async () => {
    renderizar();

    fireEvent.click(within(menu()).getByRole('link', { name: 'Clientes' }));
    expect(await screen.findByRole('heading', { name: 'Clientes' })).toBeTruthy();
    expect(
      within(menu()).getByRole('link', { name: 'Clientes' }).getAttribute('aria-current')
    ).toBe('page');

    fireEvent.click(within(menu()).getByRole('link', { name: 'Encargos' }));
    expect(await screen.findByRole('heading', { name: 'Encargos' })).toBeTruthy();

    fireEvent.click(within(menu()).getByRole('link', { name: 'Empleados' }));
    expect(await screen.findByRole('heading', { name: 'Empleados' })).toBeTruthy();

    fireEvent.click(within(menu()).getByRole('link', { name: 'Productos' }));
    expect(await screen.findByRole('heading', { name: 'Productos' })).toBeTruthy();
    expect(await screen.findByText('Fender Stratocaster')).toBeTruthy();
  });

  it('pasar de clientes a empleados no arrastra el formulario abierto', async () => {
    renderizar('/admin/clientes');

    fireEvent.click(await screen.findByRole('button', { name: 'Nuevo cliente' }));
    expect(screen.getByRole('heading', { name: 'Nuevo cliente' })).toBeTruthy();

    fireEvent.click(screen.getByRole('link', { name: 'Empleados' }));

    expect(await screen.findByRole('heading', { name: 'Empleados' })).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Nuevo empleado' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Nuevo cliente' })).toBeNull();
  });

  it('incluye un enlace para volver a la tienda', async () => {
    renderizar();

    expect(
      screen.getByRole('link', { name: 'Ir a la tienda' }).getAttribute('href')
    ).toBe('/');
    await screen.findByTestId('resumen-encargos-total');
  });

  it('sin sesión, /admin lleva a la pantalla de login', async () => {
    borrarSesion();

    renderizar();

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).toBeNull();
  });

  it('un vendedor no ve Clientes ni Empleados en el menú', async () => {
    guardarSesion(conRol('VENDEDOR', 'Vendedor'));

    renderizar();

    expect(within(menu()).getByRole('link', { name: 'Productos' })).toBeTruthy();
    expect(within(menu()).queryByRole('link', { name: 'Clientes' })).toBeNull();
    expect(within(menu()).queryByRole('link', { name: 'Empleados' })).toBeNull();
    await screen.findByTestId('resumen-encargos-total');
  });

  it('un vendedor no puede abrir /admin/clientes', async () => {
    guardarSesion(conRol('VENDEDOR', 'Vendedor'));

    renderizar('/admin/clientes');

    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeTruthy();
    expect(usuariosApi.listar).not.toHaveBeenCalled();
  });

  it('un cliente no puede entrar al panel', async () => {
    guardarSesion(conRol('CLIENTE', 'Cliente'));

    renderizar();

    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeTruthy();
  });

  it('cerrar sesión borra el token y vuelve al login', async () => {
    renderizar();

    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
    expect(leerSesion()).toBeNull();
  });

  it('si el servidor avisa que el token venció, se vuelve al login', async () => {
    dashboardApi.resumen.and.callFake(async () => {
      borrarSesion();
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
      throw new ErrorApi('Token inválido o expirado', 401);
    });

    renderizar();

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy();
  });
});
