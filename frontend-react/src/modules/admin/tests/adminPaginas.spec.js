import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../../../App.jsx';
import { guardarEncargos } from '../../../data/encargos.js';
import { guardarProductos } from '../../../data/productos.js';
import { CLAVE_USUARIOS, guardarUsuarios } from '../../../data/usuarios.js';
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

function usuariosGuardados() {
  return JSON.parse(localStorage.getItem(CLAVE_USUARIOS));
}

function encargosGuardados() {
  return JSON.parse(localStorage.getItem('listaEncargos'));
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
  function renderizar() {
    return render(
      <MemoryRouter>
        <DashboardAdmin />
      </MemoryRouter>
    );
  }

  beforeEach(() => guardarEncargos(JSON.parse(JSON.stringify(ENCARGOS))));

  it('muestra el resumen de encargos por estado', () => {
    renderizar();

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(screen.getByTestId('resumen-encargos-total').textContent).toBe('3');
    expect(screen.getByTestId('resumen-encargos-Pendiente').textContent).toBe('1');
    expect(screen.getByTestId('resumen-encargos-En Proceso').textContent).toBe('1');
    expect(screen.getByTestId('resumen-encargos-Completado').textContent).toBe('1');
    expect(screen.getByTestId('resumen-encargos-Cancelado').textContent).toBe('0');
  });

  it('lista solo los pedidos pendientes', () => {
    renderizar();

    expect(screen.getByText('ORD-001')).toBeTruthy();
    expect(screen.queryByText('ORD-002')).toBeNull();
    expect(screen.queryByText('ORD-003')).toBeNull();
  });

  it('avisa cuando no hay pedidos pendientes', () => {
    guardarEncargos([{ ...ENCARGOS[2] }]);

    renderizar();

    expect(screen.getByText('No hay pedidos pendientes actualmente.')).toBeTruthy();
  });

  it('enlaza a la lista completa de encargos', () => {
    renderizar();

    expect(
      screen.getByRole('link', { name: 'Ver todos los encargos' }).getAttribute('href')
    ).toBe('/admin/encargos');
  });
});

describe('EncargosAdmin', () => {
  beforeEach(() => guardarEncargos(JSON.parse(JSON.stringify(ENCARGOS))));

  it('lista los encargos con los más recientes primero', () => {
    render(<EncargosAdmin />);

    const filas = screen.getAllByRole('row');

    expect(within(filas[1]).getByText('ORD-003')).toBeTruthy();
    expect(within(filas[3]).getByText('ORD-001')).toBeTruthy();
  });

  it('filtra por estado', () => {
    render(<EncargosAdmin />);

    fireEvent.change(screen.getByLabelText('Filtrar por estado'), {
      target: { value: 'Pendiente' },
    });

    expect(screen.getByLabelText('Estado de ORD-001')).toBeTruthy();
    expect(screen.queryByLabelText('Estado de ORD-002')).toBeNull();
  });

  it('avisa cuando ningún encargo tiene el estado elegido', () => {
    render(<EncargosAdmin />);

    fireEvent.change(screen.getByLabelText('Filtrar por estado'), {
      target: { value: 'Cancelado' },
    });

    expect(screen.getByText('No hay encargos registrados.')).toBeTruthy();
  });

  it('cambia el estado de un encargo y lo guarda', () => {
    render(<EncargosAdmin />);

    fireEvent.change(screen.getByLabelText('Estado de ORD-001'), {
      target: { value: 'Completado' },
    });

    expect(
      screen.getByText('El estado del encargo ORD-001 fue actualizado a: Completado')
    ).toBeTruthy();
    expect(screen.getByLabelText('Estado de ORD-001').value).toBe('Completado');
    expect(encargosGuardados().find((e) => e.id === 'ORD-001').estado).toBe(
      'Completado'
    );
  });

  it('muestra el detalle de un encargo y se puede cerrar', () => {
    render(<EncargosAdmin />);

    fireEvent.click(boton('Ver detalle ORD-002'));

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

  it('el detalle indica N/A si no hay correo y "No informado" si no hay entrega', () => {
    render(<EncargosAdmin />);

    fireEvent.click(boton('Ver detalle ORD-003'));

    expect(screen.getByText('N/A')).toBeTruthy();
    expect(screen.getByText('No informado')).toBeTruthy();
  });
});

describe('PersonasAdmin - clientes', () => {
  beforeEach(() => guardarUsuarios(JSON.parse(JSON.stringify(USUARIOS))));

  it('lista solo a los clientes', () => {
    render(<PersonasAdmin tipo="cliente" />);

    expect(screen.getByRole('heading', { name: 'Clientes' })).toBeTruthy();
    expect(screen.getByText('Ana Torres')).toBeTruthy();
    expect(screen.getByText('Luis Soto')).toBeTruthy();
    expect(screen.queryByText('Vera Rojas')).toBeNull();
  });

  it('avisa si no hay clientes', () => {
    guardarUsuarios([]);

    render(<PersonasAdmin tipo="cliente" />);

    expect(
      screen.getByText('No hay clientes registrados en el sistema.')
    ).toBeTruthy();
  });

  it('crea un cliente desde el formulario', () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(boton('Nuevo cliente'));
    completar(CLIENTE_NUEVO);
    fireEvent.click(boton('Guardar'));

    expect(screen.getByText('Cliente registrado con éxito.')).toBeTruthy();
    expect(screen.getByText('María Pérez Díaz')).toBeTruthy();

    const guardado = usuariosGuardados().find((u) => u.run === '222222222');

    expect(guardado.tipoUsuario).toBe('Cliente');
    expect(guardado.password).toBe('abcdef');
  });

  it('valida el formulario y no guarda si faltan datos', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(boton('Nuevo cliente'));
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('El RUN es obligatorio.')).toBeTruthy();
    expect(screen.getByText('Debes seleccionar una región.')).toBeTruthy();
    expect(screen.getByText('La contraseña es obligatoria.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nuevo cliente' })).toBeTruthy();
    expect(usuariosGuardados().length).toBe(5);
  });

  it('rechaza un RUN con dígito verificador incorrecto', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(boton('Nuevo cliente'));
    completar({ ...CLIENTE_NUEVO, run: '12345678-9' });
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('El RUN ingresado no es válido.')).toBeTruthy();
    expect(usuariosGuardados().length).toBe(5);
  });

  it('rechaza un RUN que ya está registrado', async () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(boton('Nuevo cliente'));
    completar({ ...CLIENTE_NUEVO, run: '12345678-5' });
    fireEvent.click(boton('Guardar'));

    expect(
      (await screen.findAllByText('El RUN o Correo ya se encuentra registrado.'))
        .length
    ).toBe(2);
    expect(usuariosGuardados().length).toBe(5);
  });

  it('edita un cliente y conserva su contraseña si no se escribe otra', () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(boton('Editar 123456785'));

    expect(screen.getByRole('heading', { name: 'Editar cliente' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Nombre *'), {
      target: { value: 'Ana María' },
    });
    fireEvent.click(boton('Guardar cambios'));

    expect(screen.getByText('Cliente actualizado con éxito.')).toBeTruthy();
    expect(screen.getByText('Ana María Torres')).toBeTruthy();
    expect(usuariosGuardados()[0].password).toBe('secreta1');
    expect(usuariosGuardados()[0].run).toBe('123456785');
  });

  it('elimina un cliente solo después de confirmar', () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(boton('Editar 123456785'));
    fireEvent.click(boton('Eliminar cliente'));

    expect(screen.getByText(/¿Eliminar al cliente/)).toBeTruthy();
    expect(usuariosGuardados().length).toBe(5);

    fireEvent.click(boton('Confirmar eliminación'));

    expect(screen.getByText('Cliente eliminado correctamente.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Editar 123456785' })).toBeNull();
    expect(usuariosGuardados().length).toBe(4);
  });

  it('no elimina nada si se cancela la confirmación', () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(boton('Editar 123456785'));
    fireEvent.click(boton('Eliminar cliente'));
    fireEvent.click(boton('Cancelar eliminación'));

    expect(screen.queryByText(/¿Eliminar al cliente/)).toBeNull();
    expect(boton('Eliminar cliente')).toBeTruthy();
    expect(usuariosGuardados().length).toBe(5);
  });

  it('cancelar el formulario vuelve a la lista sin guardar', () => {
    render(<PersonasAdmin tipo="cliente" />);

    fireEvent.click(boton('Nuevo cliente'));
    fireEvent.click(boton('Cancelar'));

    expect(boton('Nuevo cliente')).toBeTruthy();
    expect(usuariosGuardados().length).toBe(5);
  });
});

describe('PersonasAdmin - empleados', () => {
  beforeEach(() => guardarUsuarios(JSON.parse(JSON.stringify(USUARIOS))));

  it('lista solo a los empleados', () => {
    render(<PersonasAdmin tipo="empleado" />);

    expect(screen.getByRole('heading', { name: 'Empleados' })).toBeTruthy();
    expect(screen.getByText('Vera Rojas')).toBeTruthy();
    expect(screen.getByText('Carlos Silva')).toBeTruthy();
    expect(screen.getByText('Demo')).toBeTruthy();
    expect(screen.queryByText('Ana Torres')).toBeNull();
  });

  it('filtra entre administradores y empleados / vendedores', () => {
    render(<PersonasAdmin tipo="empleado" />);

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

  it('crea un empleado con su rol', () => {
    render(<PersonasAdmin tipo="empleado" />);

    fireEvent.click(boton('Nuevo empleado'));
    completar({ ...CLIENTE_NUEVO, rol: 'Administrador' });
    fireEvent.click(boton('Guardar'));

    expect(screen.getByText('Empleado registrado con éxito.')).toBeTruthy();

    const guardado = usuariosGuardados().find((u) => u.run === '222222222');

    expect(guardado.tipoUsuario).toBe('Administrador');
    expect(guardado.rol).toBe('Administrador');
  });

  it('exige elegir un rol', async () => {
    render(<PersonasAdmin tipo="empleado" />);

    fireEvent.click(boton('Nuevo empleado'));
    fireEvent.click(boton('Guardar'));

    expect(await screen.findByText('Debes seleccionar un rol o cargo.')).toBeTruthy();
    expect(usuariosGuardados().length).toBe(5);
  });

  it('edita a un empleado antiguo sin RUN conservando su correo', () => {
    render(<PersonasAdmin tipo="empleado" />);

    fireEvent.click(boton('Editar demo@duoc.cl'));
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

    expect(screen.getByText('Empleado actualizado con éxito.')).toBeTruthy();

    const demo = usuariosGuardados().find((u) => u.correo === 'demo@duoc.cl');

    expect(demo.apellidos).toBe('De Prueba');
    expect(demo.tipoUsuario).toBe('Vendedor');
    expect(demo.password).toBe('1234');
  });

  it('elimina a un empleado después de confirmar', () => {
    render(<PersonasAdmin tipo="empleado" />);

    fireEvent.click(boton('Editar 76543216'));
    fireEvent.click(boton('Eliminar empleado'));

    expect(screen.getByText(/¿Eliminar al empleado/)).toBeTruthy();

    fireEvent.click(boton('Confirmar eliminación'));

    expect(screen.getByText('Empleado eliminado correctamente.')).toBeTruthy();
    expect(usuariosGuardados().some((u) => u.run === '76543216')).toBeFalse();
  });
});

// ---------------------------------------------------------------------------
// 3. Rutas y menú del panel (con la aplicación completa)
// ---------------------------------------------------------------------------

describe('Rutas del panel administrativo', () => {
  function renderizar(ruta = '/admin') {
    return render(
      <MemoryRouter initialEntries={[ruta]}>
        <App />
      </MemoryRouter>
    );
  }

  beforeEach(() => {
    guardarEncargos(JSON.parse(JSON.stringify(ENCARGOS)));
    guardarUsuarios(JSON.parse(JSON.stringify(USUARIOS)));
    guardarProductos([
      {
        codigo: 'GTR001',
        categoria: 'Guitarras Eléctricas',
        nombre: 'Stratocaster',
        marca: 'Fender',
        stock: 5,
        precio: 650000,
      },
    ]);
  });

  it('/admin muestra el menú lateral y el dashboard', () => {
    renderizar();

    const menu = screen.getByRole('navigation', { name: 'Menú de administración' });

    ['Dashboard', 'Productos', 'Encargos', 'Clientes', 'Empleados'].forEach(
      (nombre) => {
        expect(within(menu).getByRole('link', { name: nombre })).toBeTruthy();
      }
    );
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeTruthy();
    expect(
      within(menu).getByRole('link', { name: 'Dashboard' }).getAttribute('aria-current')
    ).toBe('page');
  });

  it('el menú lleva a cada sección y marca la activa', async () => {
    renderizar();
    const menu = screen.getByRole('navigation', { name: 'Menú de administración' });

    fireEvent.click(within(menu).getByRole('link', { name: 'Clientes' }));
    expect(await screen.findByRole('heading', { name: 'Clientes' })).toBeTruthy();
    expect(
      within(menu).getByRole('link', { name: 'Clientes' }).getAttribute('aria-current')
    ).toBe('page');

    fireEvent.click(within(menu).getByRole('link', { name: 'Encargos' }));
    expect(await screen.findByRole('heading', { name: 'Encargos' })).toBeTruthy();

    fireEvent.click(within(menu).getByRole('link', { name: 'Empleados' }));
    expect(await screen.findByRole('heading', { name: 'Empleados' })).toBeTruthy();

    fireEvent.click(within(menu).getByRole('link', { name: 'Productos' }));
    expect(await screen.findByRole('heading', { name: 'Productos' })).toBeTruthy();
    expect(await screen.findByText('Fender Stratocaster')).toBeTruthy();
  });

  it('pasar de clientes a empleados no arrastra el formulario abierto', async () => {
    renderizar('/admin/clientes');

    fireEvent.click(boton('Nuevo cliente'));
    expect(screen.getByRole('heading', { name: 'Nuevo cliente' })).toBeTruthy();

    fireEvent.click(screen.getByRole('link', { name: 'Empleados' }));

    expect(await screen.findByRole('heading', { name: 'Empleados' })).toBeTruthy();
    expect(boton('Nuevo empleado')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Nuevo cliente' })).toBeNull();
  });

  it('incluye un enlace para volver a la tienda', () => {
    renderizar();

    expect(
      screen.getByRole('link', { name: 'Ir a la tienda' }).getAttribute('href')
    ).toBe('/');
  });
});
