// Servicios del panel que hablan con el backend. Las llamadas a la API se
// reemplazan por el "backend falso" de src/tests/baseFalsa.js (sin servidor).

import { productosApi, usuariosApi, encargosApi } from '../../../api/adminApi.js';
import { ErrorApi } from '../../../api/http.js';
import { ENCARGOS_INICIALES } from '../../../data/encargos.js';
import {
  UBICACIONES_FALSAS,
  instalarEncargosFalsos,
  instalarProductosFalsos,
  instalarUsuariosFalsos,
} from '../../../tests/baseFalsa.js';
import {
  borrarProducto,
  guardarProducto,
  listarProductos,
} from '../services/adminService.js';
import {
  aEncargo,
  cambiarEstado,
  detalleEncargo,
  formatearTotal,
  listarEncargos,
  listarPendientes,
  resumenEncargos,
  textoEntrega,
} from '../services/encargosService.js';
import {
  aPersona,
  borrarPersona,
  filtrarEmpleados,
  guardarPersona,
  listarPersonas,
} from '../services/personasService.js';

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

describe('Servicio de productos con el backend', () => {
  const PRODUCTOS = [
    { codigo: 'GTR001', categoria: 'Guitarras Eléctricas', nombre: 'Stratocaster', marca: 'Fender', stock: 5, precio: 650000, fechaIngreso: '2026-01-10' },
    { codigo: 'BAT001', categoria: 'Baterías', nombre: 'Stage Custom', marca: 'Yamaha', stock: 1, stockCritico: 2, precio: 850000 },
    { codigo: 'ACC001', categoria: 'Accesorios', nombre: 'Cable Jack', stock: 0, precio: 0 },
  ];

  const DATOS_VALIDOS = {
    codigo: 'tec001',
    nombre: '  Teclado Casio  ',
    marca: 'Casio',
    modelo: 'CT-S1',
    descripcion: '',
    categoria: 'Teclados y Pianos',
    precio: '250000',
    stock: '4',
    stockCritico: '',
  };

  let bd;

  beforeEach(() => {
    bd = instalarProductosFalsos(PRODUCTOS);
  });

  it('listarProductos pide la lista al servidor', async () => {
    expect((await listarProductos()).length).toBe(3);
    expect(productosApi.listar).toHaveBeenCalled();
  });

  it('guardarProducto crea un producto válido y envía los datos ya normalizados', async () => {
    const resultado = await guardarProducto(DATOS_VALIDOS);

    expect(resultado.ok).toBeTrue();
    expect(resultado.producto.codigo).toBe('TEC001');
    expect(bd.length).toBe(4);
    expect(productosApi.crear).toHaveBeenCalledWith(
      jasmine.objectContaining({
        codigo: 'TEC001',
        nombre: 'Teclado Casio',
        precio: 250000,
        stock: 4,
        stockCritico: null,
      })
    );
  });

  it('guardarProducto no llama al servidor si los datos son inválidos', async () => {
    const resultado = await guardarProducto({ ...DATOS_VALIDOS, nombre: '' });

    expect(resultado.ok).toBeFalse();
    expect(resultado.errores.nombre).toBeDefined();
    expect(productosApi.crear).not.toHaveBeenCalled();
    expect(bd.length).toBe(3);
  });

  it('guardarProducto rechaza un código que ya existe', async () => {
    const resultado = await guardarProducto({ ...DATOS_VALIDOS, codigo: 'bat001' });

    expect(resultado.ok).toBeFalse();
    expect(resultado.errores.codigo).toMatch(/Ya existe/);
    expect(productosApi.crear).not.toHaveBeenCalled();
  });

  it('guardarProducto edita sin permitir cambiar el código', async () => {
    const resultado = await guardarProducto(
      { ...DATOS_VALIDOS, codigo: 'IGNORADO', nombre: 'Stratocaster II', categoria: 'Guitarras Eléctricas' },
      'GTR001'
    );

    expect(resultado.ok).toBeTrue();
    expect(productosApi.actualizar.calls.mostRecent().args[0]).toBe('GTR001');
    expect(bd.length).toBe(3);
    expect(bd[0].codigo).toBe('GTR001');
    expect(bd[0].nombre).toBe('Stratocaster II');
    expect(bd[0].fechaIngreso).toBe('2026-01-10');
  });

  it('borrarProducto devuelve la respuesta del servidor', async () => {
    const respuesta = await borrarProducto('ACC001');

    expect(respuesta.eliminado).toBeTrue();
    expect(bd.length).toBe(2);
    expect(productosApi.eliminar).toHaveBeenCalledWith('ACC001');
  });

  it('muestra como error de campo lo que rechaza el servidor', async () => {
    productosApi.crear.and.rejectWith(
      new ErrorApi('Hay datos que no son válidos', 400, { nombre: 'El nombre admite hasta 100 caracteres' })
    );

    const resultado = await guardarProducto(DATOS_VALIDOS);

    expect(resultado.ok).toBeFalse();
    expect(resultado.errores.nombre).toBe('El nombre admite hasta 100 caracteres');
  });

  it('un conflicto 409 se muestra en el campo código', async () => {
    productosApi.crear.and.rejectWith(
      new ErrorApi('Ya existe un producto con el código TEC001', 409)
    );

    const resultado = await guardarProducto(DATOS_VALIDOS);

    expect(resultado.ok).toBeFalse();
    expect(resultado.errores.codigo).toBe('Ya existe un producto con el código TEC001');
  });

  it('los errores sin campo (por ejemplo sin conexión) se propagan', async () => {
    productosApi.crear.and.rejectWith(new ErrorApi('No se pudo conectar con el servidor', 0));

    await expectAsync(guardarProducto(DATOS_VALIDOS)).toBeRejectedWithError(
      'No se pudo conectar con el servidor'
    );
  });
});

// ---------------------------------------------------------------------------
// Clientes y empleados
// ---------------------------------------------------------------------------

describe('Servicio de personas con el backend', () => {
  // RUN válidos: 12345678-5, 11111111-1, 7654321-6 y 9876543-3.
  const USUARIOS = [
    { run: '123456785', nombre: 'Ana', apellidos: 'Torres', correo: 'ana@duoc.cl', tipoUsuario: 'Cliente', region: 'Valparaíso', comuna: 'Viña del Mar', direccion: 'Calle 1', fechaRegistro: '2026-02-01', estado: 'Activo' },
    { run: '111111111', nombre: 'Luis', apellidos: 'Soto', correo: 'luis@gmail.com', tipoUsuario: 'Cliente', region: 'Maule', comuna: 'Talca', direccion: 'Calle 2' },
    { run: '76543216', nombre: 'Vera', apellidos: 'Rojas', correo: 'vera@duoc.cl', tipoUsuario: 'Vendedor', region: 'Valparaíso', comuna: 'Valparaíso', direccion: 'Calle 3', fechaRegistro: '2026-02-03' },
    { run: '98765433', nombre: 'Carlos', apellidos: 'Silva', correo: 'carlos@profesor.duoc.cl', tipoUsuario: 'Administrador', region: 'Biobío', comuna: 'Concepción', direccion: 'Calle 4' },
    // Usuario de demostración antiguo: sin RUN ni apellidos
    { nombre: 'Demo', correo: 'demo@duoc.cl', tipoUsuario: 'Empleado' },
  ];

  const DATOS_CLIENTE = {
    run: '22.222.222-2',
    nombre: '  María ',
    apellidos: 'Pérez Díaz',
    correo: 'maria@duoc.cl',
    region: 'Valparaíso',
    comuna: 'Valparaíso',
    direccion: 'Av. España 123',
    contrasena: 'abcdef',
    confirmarContrasena: 'abcdef',
  };

  const DATOS_EMPLEADO = { ...DATOS_CLIENTE, rol: 'Vendedor' };

  let bd;

  beforeEach(() => {
    bd = instalarUsuariosFalsos(USUARIOS);
  });

  describe('listado', () => {
    it('listarPersonas separa clientes y empleados', async () => {
      expect((await listarPersonas('cliente')).map((u) => u.nombre)).toEqual(['Ana', 'Luis']);
      expect((await listarPersonas('empleado')).map((u) => u.nombre)).toEqual(['Vera', 'Carlos', 'Demo']);
      expect(usuariosApi.listar).toHaveBeenCalledWith('clientes');
      expect(usuariosApi.listar).toHaveBeenCalledWith('empleados');
    });

    it('aPersona entrega los campos que usan los componentes', () => {
      const persona = aPersona(bd[0]);

      expect(persona.id).toBe(1);
      expect(persona.tipoUsuario).toBe('Cliente');
      expect(persona.region).toBe('Valparaíso');
      expect(persona.comuna).toBe('Viña del Mar');
      expect(persona.fechaRegistro).toBe('2026-02-01');
    });

    it('aPersona usa valores vacíos cuando el usuario no tiene datos opcionales', () => {
      const persona = aPersona({ id: 9, nombre: 'Demo', correo: 'd@d.cl', tipo: 'Vendedor', estado: 'Activo' });

      expect(persona.run).toBe('');
      expect(persona.apellidos).toBe('');
      expect(persona.region).toBe('');
      expect(persona.fechaRegistro).toBe('');
    });

    it('filtrarEmpleados agrupa Empleados y Vendedores en "Empleado"', async () => {
      const empleados = await listarPersonas('empleado');

      expect(filtrarEmpleados(empleados, 'Administrador').map((e) => e.nombre)).toEqual(['Carlos']);
      expect(filtrarEmpleados(empleados, 'Empleado').map((e) => e.nombre)).toEqual(['Vera', 'Demo']);
    });
  });

  describe('guardarPersona y borrarPersona', () => {
    it('crea un cliente válido', async () => {
      const resultado = await guardarPersona(DATOS_CLIENTE, 'cliente');

      expect(resultado.ok).toBeTrue();
      expect(resultado.persona.run).toBe('222222222');
      expect(resultado.persona.tipoUsuario).toBe('Cliente');
      expect(resultado.persona.estado).toBe('Activo');
      expect(resultado.persona.region).toBe('Valparaíso');
      expect(resultado.persona.fechaRegistro).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(bd.length).toBe(6);
    });

    it('envía al servidor el id de la comuna y la contraseña', async () => {
      await guardarPersona(DATOS_CLIENTE, 'cliente');

      const region = UBICACIONES_FALSAS.regiones.find((r) => r.nombre === 'Valparaíso');
      const valparaiso = UBICACIONES_FALSAS.comunas.find(
        (c) => c.nombre === 'Valparaíso' && c.idRegion === region.id
      );
      const enviado = usuariosApi.crear.calls.mostRecent().args[0];

      expect(enviado.idComuna).toBe(valparaiso.id);
      expect(enviado.password).toBe('abcdef');
      expect(enviado.run).toBe('222222222');
      expect(enviado.tipo).toBe('Cliente');
      expect(enviado.nombre).toBe('María');
    });

    it('crea un empleado con el rol elegido', async () => {
      const resultado = await guardarPersona({ ...DATOS_EMPLEADO, rol: 'Administrador' }, 'empleado');

      expect(resultado.ok).toBeTrue();
      expect(resultado.persona.tipoUsuario).toBe('Administrador');
      expect((await listarPersonas('empleado')).length).toBe(4);
    });

    it('no llama al servidor si los datos son inválidos', async () => {
      const resultado = await guardarPersona({ ...DATOS_CLIENTE, nombre: '' }, 'cliente');

      expect(resultado.ok).toBeFalse();
      expect(resultado.errores.nombre).toBeDefined();
      expect(usuariosApi.crear).not.toHaveBeenCalled();
      expect(bd.length).toBe(5);
    });

    it('rechaza un RUN que ya existe', async () => {
      const resultado = await guardarPersona({ ...DATOS_CLIENTE, run: '12345678-5' }, 'cliente');

      expect(resultado.ok).toBeFalse();
      expect(usuariosApi.crear).not.toHaveBeenCalled();
    });

    it('falla si la comuna no existe en la base de datos', async () => {
      await expectAsync(
        guardarPersona({ ...DATOS_CLIENTE, comuna: 'Atlantis' }, 'cliente')
      ).toBeRejectedWithError(/no existe en la base de datos/);
    });

    it('edita conservando RUN, fecha de registro y contraseña si no se escribe una nueva', async () => {
      const resultado = await guardarPersona(
        { ...DATOS_CLIENTE, run: 'otro', correo: 'ana@duoc.cl', nombre: 'Ana María', contrasena: '', confirmarContrasena: '' },
        'cliente',
        '123456785'
      );
      const [idEnviado, cuerpo] = usuariosApi.actualizar.calls.mostRecent().args;

      expect(resultado.ok).toBeTrue();
      expect(idEnviado).toBe(1);
      expect(cuerpo.run).toBe('123456785');
      expect(cuerpo.password).toBeUndefined();
      expect(cuerpo.estado).toBe('Activo');
      expect(bd[0].nombre).toBe('Ana María');
      expect(bd[0].fechaRegistro).toBe('2026-02-01T10:00:00');
      expect(bd.length).toBe(5);
    });

    it('envía la contraseña nueva cuando se escribe una', async () => {
      await guardarPersona(
        { ...DATOS_CLIENTE, correo: 'ana@duoc.cl', contrasena: 'nueva123', confirmarContrasena: 'nueva123' },
        'cliente',
        '123456785'
      );

      expect(usuariosApi.actualizar.calls.mostRecent().args[1].password).toBe('nueva123');
    });

    it('al cambiar el rol de un empleado cambia su tipo de usuario', async () => {
      await guardarPersona(
        { ...DATOS_EMPLEADO, correo: 'vera@duoc.cl', rol: 'Administrador', contrasena: '', confirmarContrasena: '' },
        'empleado',
        '76543216'
      );

      expect(bd[2].tipo).toBe('Administrador');
    });

    it('edita a un empleado antiguo sin RUN usando su correo', async () => {
      const resultado = await guardarPersona(
        { ...DATOS_EMPLEADO, correo: 'demo@duoc.cl', contrasena: '', confirmarContrasena: '' },
        'empleado',
        'demo@duoc.cl'
      );

      expect(resultado.ok).toBeTrue();
      expect(usuariosApi.actualizar.calls.mostRecent().args[1].run).toBeUndefined();
      expect(bd[4].tipo).toBe('Vendedor');
      expect(bd.length).toBe(5);
    });

    it('falla si la persona que se edita ya no existe', async () => {
      await expectAsync(
        guardarPersona(
          { ...DATOS_CLIENTE, contrasena: '', confirmarContrasena: '' },
          'cliente',
          '99999999'
        )
      ).toBeRejectedWithError('El usuario ya no existe.');
    });

    it('un conflicto de correo del servidor se muestra en el campo correo', async () => {
      usuariosApi.crear.and.rejectWith(new ErrorApi('Ya existe un usuario con ese correo', 409));

      const resultado = await guardarPersona(DATOS_CLIENTE, 'cliente');

      expect(resultado.ok).toBeFalse();
      expect(resultado.errores.correo).toBe('Ya existe un usuario con ese correo');
    });

    it('un conflicto de RUN del servidor se muestra en el campo run', async () => {
      usuariosApi.crear.and.rejectWith(new ErrorApi('Ya existe un usuario con ese RUN', 409));

      const resultado = await guardarPersona(DATOS_CLIENTE, 'cliente');

      expect(resultado.errores.run).toBe('Ya existe un usuario con ese RUN');
    });

    it('muestra los errores por campo que devuelve el servidor', async () => {
      usuariosApi.crear.and.rejectWith(
        new ErrorApi('Hay datos que no son válidos', 400, { correo: 'El correo no es válido' })
      );

      const resultado = await guardarPersona(DATOS_CLIENTE, 'cliente');

      expect(resultado.ok).toBeFalse();
      expect(resultado.errores.correo).toBe('El correo no es válido');
    });

    it('los errores sin campo se propagan', async () => {
      usuariosApi.crear.and.rejectWith(new ErrorApi('No se pudo conectar con el servidor', 0));

      await expectAsync(guardarPersona(DATOS_CLIENTE, 'cliente')).toBeRejectedWithError(
        'No se pudo conectar con el servidor'
      );
    });

    it('borrarPersona elimina a la persona por su id', async () => {
      await borrarPersona({ id: 2 });

      expect(usuariosApi.eliminar).toHaveBeenCalledWith(2);
      expect((await listarPersonas('cliente')).length).toBe(1);
    });

    it('borrarPersona propaga el error si la persona no existe', async () => {
      await expectAsync(borrarPersona({ id: 99 })).toBeRejectedWithError('Usuario no encontrado');
    });
  });
});

// ---------------------------------------------------------------------------
// Encargos y dashboard
// ---------------------------------------------------------------------------

describe('Servicio de encargos con el backend', () => {
  const ids = (lista) => lista.map((encargo) => encargo.id);

  beforeEach(() => {
    instalarEncargosFalsos(ENCARGOS_INICIALES);
  });

  it('listarEncargos muestra primero los más recientes', async () => {
    expect(ids(await listarEncargos())).toEqual(['ORD-003', 'ORD-002', 'ORD-001']);
  });

  it('listarEncargos filtra por estado pidiéndolo al servidor', async () => {
    expect(ids(await listarEncargos('Pendiente'))).toEqual(['ORD-001']);
    expect(encargosApi.listar).toHaveBeenCalledWith('Pendiente');
    expect((await listarEncargos('todos')).length).toBe(3);
    expect(encargosApi.listar).toHaveBeenCalledWith(undefined);
    expect(await listarEncargos('Cancelado')).toEqual([]);
  });

  it('listarPendientes devuelve solo los pendientes', async () => {
    expect(ids(await listarPendientes())).toEqual(['ORD-001']);
  });

  it('aEncargo recorta la fecha y traduce el retiro en tienda', () => {
    const encargo = aEncargo({
      id: 5,
      numeroOrden: 'ORD-005',
      cliente: 'Ana',
      fecha: '2026-11-14T10:30:00',
      estado: 'Pendiente',
      tipoEntrega: 'Retiro en tienda',
      total: 1000,
    });

    expect(encargo.id).toBe('ORD-005');
    expect(encargo.idApi).toBe(5);
    expect(encargo.fecha).toBe('2026-11-14');
    expect(encargo.tipoEntrega).toBe('retiro');
    expect(encargo.items).toEqual([]);
  });

  it('cambiarEstado actualiza el encargo usando el id del servidor', async () => {
    const actualizado = await cambiarEstado('ORD-002', 'Cancelado');

    expect(actualizado.estado).toBe('Cancelado');
    expect(encargosApi.cambiarEstado).toHaveBeenCalledWith(2, 'Cancelado');
    expect(ids(await listarEncargos('Cancelado'))).toEqual(['ORD-002']);
  });

  it('cambiarEstado rechaza un estado inválido sin llamar al servidor', async () => {
    await expectAsync(cambiarEstado('ORD-001', 'Roto')).toBeRejectedWithError(/no es válido/);
    expect(encargosApi.cambiarEstado).not.toHaveBeenCalled();
  });

  it('cambiarEstado falla si el encargo no existe', async () => {
    await expectAsync(cambiarEstado('ORD-999', 'Cancelado')).toBeRejectedWithError(
      'No existe el encargo "ORD-999".'
    );
  });

  it('cambiarEstado propaga el rechazo del servidor', async () => {
    encargosApi.cambiarEstado.and.rejectWith(
      new ErrorApi('Un encargo completado ya no puede cambiar de estado', 409)
    );

    await expectAsync(cambiarEstado('ORD-003', 'Pendiente')).toBeRejectedWithError(/ya no puede cambiar/);
  });

  it('detalleEncargo devuelve el encargo o null', async () => {
    expect((await detalleEncargo('ORD-003')).correo).toBe('maria@duoc.cl');
    expect(await detalleEncargo('ORD-999')).toBeNull();
  });

  it('formatearTotal muestra pesos chilenos y trata valores vacíos como 0', () => {
    expect(formatearTotal(45990)).toMatch(/45\.990/);
    expect(formatearTotal(0)).toMatch(/0/);
    expect(formatearTotal(undefined)).toMatch(/0/);
  });

  it('textoEntrega traduce el tipo de entrega', () => {
    expect(textoEntrega('retiro')).toBe('Retiro en tienda');
    expect(textoEntrega('Entrega express')).toBe('Entrega express');
    expect(textoEntrega('despacho')).toBe('Despacho a domicilio');
    expect(textoEntrega(undefined)).toBe('No informado');
    expect(textoEntrega(null)).toBe('No informado');
  });

  it('resumenEncargos cuenta el total y los encargos de cada estado', async () => {
    expect(await resumenEncargos()).toEqual({
      total: 3,
      Pendiente: 1,
      'En Proceso': 1,
      Completado: 1,
      Cancelado: 0,
    });
  });

  it('resumenEncargos refleja los cambios de estado', async () => {
    await cambiarEstado('ORD-001', 'Cancelado');

    const resumen = await resumenEncargos();

    expect(resumen.Pendiente).toBe(0);
    expect(resumen.Cancelado).toBe(1);
  });
});
