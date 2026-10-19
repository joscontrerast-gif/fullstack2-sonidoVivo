import {
  CLAVE_USUARIOS,
  actualizarUsuario,
  claveDe,
  crearUsuario,
  eliminarUsuario,
  guardarUsuarios,
  normalizarRun,
  obtenerUsuarioPorClave,
  obtenerUsuarios,
} from '../../../data/usuarios.js';
import { REGIONES, obtenerComunas } from '../../../data/regiones.js';
import {
  DOMINIOS_PERMITIDOS,
  calcularDigitoVerificador,
  validarConfirmacion,
  validarContrasena,
  validarCorreo,
  validarRun,
  validarSeleccion,
  validarTexto,
} from '../services/validaciones.js';
import {
  CONFIG_PERSONAS,
  ROLES_EMPLEADO,
  borrarPersona,
  esDelTipo,
  estadoDe,
  filtrarEmpleados,
  guardarPersona,
  listarPersonas,
  nombreCompleto,
  rolDe,
  validarPersona,
} from '../services/personasService.js';

// ---------------------------------------------------------------------------
// Datos de prueba
// ---------------------------------------------------------------------------

// RUN válidos (dígito verificador correcto): 12345678-5, 11111111-1,
// 7654321-6, 9876543-3 y 22222222-2.
const USUARIOS_PRUEBA = [
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
    fechaRegistro: '2026-02-02',
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
    fechaRegistro: '2026-02-03',
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
    fechaRegistro: '2026-02-04',
  },
  // Usuario de demostración antiguo: sin RUN, solo nombre y correo
  {
    nombre: 'Demo',
    correo: 'demo@duoc.cl',
    password: '1234',
    tipoUsuario: 'Empleado',
  },
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

function copiaUsuarios() {
  return JSON.parse(JSON.stringify(USUARIOS_PRUEBA));
}

function usuariosGuardados() {
  return JSON.parse(localStorage.getItem(CLAVE_USUARIOS));
}

// ---------------------------------------------------------------------------
// 1. Capa de datos de usuarios
// ---------------------------------------------------------------------------

describe('Capa de datos de usuarios', () => {
  describe('normalizarRun y claveDe', () => {
    it('normalizarRun quita puntos y guion y pasa a mayúsculas', () => {
      expect(normalizarRun(' 12.345.678-k ')).toBe('12345678K');
      expect(normalizarRun(null)).toBe('');
    });

    it('claveDe usa el RUN normalizado', () => {
      expect(claveDe({ run: '12.345.678-5', correo: 'a@duoc.cl' })).toBe(
        '123456785'
      );
    });

    it('claveDe usa el correo en minúsculas si el usuario no tiene RUN', () => {
      expect(claveDe({ correo: ' Demo@Duoc.cl ' })).toBe('demo@duoc.cl');
    });
  });

  describe('obtenerUsuarios', () => {
    it('devuelve una lista vacía si no hay datos', () => {
      expect(obtenerUsuarios()).toEqual([]);
    });

    it('devuelve los usuarios guardados', () => {
      guardarUsuarios(copiaUsuarios());

      expect(obtenerUsuarios().length).toBe(5);
    });

    it('devuelve una lista vacía si lo guardado está corrupto', () => {
      localStorage.setItem(CLAVE_USUARIOS, 'esto no es json');

      expect(obtenerUsuarios()).toEqual([]);
    });

    it('devuelve una lista vacía si lo guardado no es una lista', () => {
      localStorage.setItem(CLAVE_USUARIOS, '{"run":"1"}');

      expect(obtenerUsuarios()).toEqual([]);
    });
  });

  describe('obtenerUsuarioPorClave', () => {
    beforeEach(() => guardarUsuarios(copiaUsuarios()));

    it('encuentra un usuario por RUN con cualquier formato', () => {
      expect(obtenerUsuarioPorClave('12.345.678-5').nombre).toBe('Ana');
    });

    it('encuentra un usuario sin RUN por su correo', () => {
      expect(obtenerUsuarioPorClave('DEMO@duoc.cl').nombre).toBe('Demo');
    });

    it('devuelve null si no existe', () => {
      expect(obtenerUsuarioPorClave('99999999')).toBeNull();
    });
  });

  describe('crearUsuario', () => {
    beforeEach(() => guardarUsuarios(copiaUsuarios()));

    it('agrega el usuario con RUN normalizado, fecha de registro y estado', () => {
      const nuevo = crearUsuario({
        run: '22.222.222-2',
        nombre: 'María',
        correo: 'maria@duoc.cl',
      });

      expect(nuevo.run).toBe('222222222');
      expect(nuevo.fechaRegistro).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(nuevo.estado).toBe('Activo');
      expect(usuariosGuardados().length).toBe(6);
    });

    it('rechaza un RUN repetido aunque tenga otro formato', () => {
      expect(() =>
        crearUsuario({ run: '12.345.678-5', correo: 'otro@duoc.cl' })
      ).toThrowError('El RUN o Correo ya se encuentra registrado.');

      expect(usuariosGuardados().length).toBe(5);
    });

    it('rechaza un correo repetido sin importar mayúsculas', () => {
      expect(() =>
        crearUsuario({ run: '222222222', correo: 'ANA@duoc.cl' })
      ).toThrowError('El RUN o Correo ya se encuentra registrado.');
    });
  });

  describe('actualizarUsuario', () => {
    beforeEach(() => guardarUsuarios(copiaUsuarios()));

    it('cambia los datos pero conserva la fecha de registro y la contraseña', () => {
      const actualizado = actualizarUsuario('123456785', {
        nombre: 'Ana María',
        fechaRegistro: '1999-01-01',
        password: '',
      });

      expect(actualizado.nombre).toBe('Ana María');
      expect(actualizado.fechaRegistro).toBe('2026-02-01');
      expect(actualizado.password).toBe('secreta1');
      expect(usuariosGuardados()[0].nombre).toBe('Ana María');
    });

    it('cambia la contraseña cuando se envía una nueva', () => {
      expect(actualizarUsuario('123456785', { password: 'nueva123' }).password).toBe(
        'nueva123'
      );
    });

    it('rechaza el correo de otro usuario', () => {
      expect(() =>
        actualizarUsuario('123456785', { correo: 'LUIS@gmail.com' })
      ).toThrowError('El RUN o Correo ya se encuentra registrado.');
    });

    it('permite conservar el propio correo', () => {
      expect(
        actualizarUsuario('123456785', { correo: 'ana@duoc.cl' }).correo
      ).toBe('ana@duoc.cl');
    });

    it('actualiza a un usuario sin RUN usando su correo', () => {
      const actualizado = actualizarUsuario('demo@duoc.cl', { nombre: 'Demo 2' });

      expect(actualizado.nombre).toBe('Demo 2');
      expect(usuariosGuardados().length).toBe(5);
    });

    it('falla si el usuario no existe', () => {
      expect(() => actualizarUsuario('99999999', { nombre: 'X' })).toThrowError(
        'No existe el usuario que intentas modificar.'
      );
    });
  });

  describe('eliminarUsuario', () => {
    beforeEach(() => guardarUsuarios(copiaUsuarios()));

    it('elimina por RUN y devuelve el usuario eliminado', () => {
      const eliminado = eliminarUsuario('111111111');

      expect(eliminado.nombre).toBe('Luis');
      expect(usuariosGuardados().length).toBe(4);
    });

    it('elimina a un usuario sin RUN por su correo', () => {
      eliminarUsuario('demo@duoc.cl');

      expect(usuariosGuardados().some((u) => u.nombre === 'Demo')).toBeFalse();
    });

    it('falla si el usuario no existe', () => {
      expect(() => eliminarUsuario('99999999')).toThrowError(
        'No existe el usuario que intentas eliminar.'
      );
    });
  });
});

// ---------------------------------------------------------------------------
// 2. Regiones y comunas
// ---------------------------------------------------------------------------

describe('Regiones y comunas', () => {
  it('incluye las 16 regiones de Chile, cada una con comunas', () => {
    expect(REGIONES.length).toBe(16);
    expect(REGIONES.every((region) => region.comunas.length > 0)).toBeTrue();
  });

  it('obtenerComunas devuelve las comunas de la región indicada', () => {
    expect(obtenerComunas('Valparaíso')).toContain('Viña del Mar');
  });

  it('obtenerComunas devuelve una lista vacía si la región no existe', () => {
    expect(obtenerComunas('')).toEqual([]);
    expect(obtenerComunas('Atlántida')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. Validaciones de campos
// ---------------------------------------------------------------------------

describe('Validaciones de formularios de personas', () => {
  describe('validarTexto', () => {
    it('acepta un texto con contenido', () => {
      expect(validarTexto('Ana', 'El nombre', 50)).toBeNull();
    });

    it('rechaza un texto vacío o solo con espacios', () => {
      expect(validarTexto('   ', 'El nombre', 50)).toBe('El nombre es obligatorio.');
      expect(validarTexto(undefined, 'El nombre', 50)).toBe(
        'El nombre es obligatorio.'
      );
    });

    it('rechaza un texto que supera el máximo', () => {
      expect(validarTexto('a'.repeat(51), 'El nombre', 50)).toBe(
        'El nombre no puede superar los 50 caracteres.'
      );
    });
  });

  describe('validarSeleccion', () => {
    it('acepta una opción elegida', () => {
      expect(validarSeleccion('Maule', 'una región')).toBeNull();
    });

    it('rechaza una opción vacía', () => {
      expect(validarSeleccion('', 'una región')).toBe('Debes seleccionar una región.');
    });
  });

  describe('validarCorreo', () => {
    it('acepta los dominios permitidos, sin importar mayúsculas', () => {
      expect(DOMINIOS_PERMITIDOS.length).toBe(3);
      expect(validarCorreo('ana@duoc.cl')).toBeNull();
      expect(validarCorreo('ana@profesor.duoc.cl')).toBeNull();
      expect(validarCorreo('ANA@GMAIL.COM')).toBeNull();
    });

    it('rechaza un correo vacío', () => {
      expect(validarCorreo('  ')).toBe('El correo es obligatorio.');
    });

    it('rechaza un formato inválido', () => {
      expect(validarCorreo('ana.duoc.cl')).toBe('Ingresa un correo con formato válido.');
      expect(validarCorreo('ana@duoc')).toBe('Ingresa un correo con formato válido.');
    });

    it('rechaza un dominio no permitido', () => {
      expect(validarCorreo('ana@hotmail.com')).toMatch(/Solo se aceptan correos/);
    });

    it('rechaza un correo de más de 100 caracteres', () => {
      expect(validarCorreo(`${'a'.repeat(95)}@duoc.cl`)).toMatch(/100 caracteres/);
    });
  });

  describe('RUN', () => {
    it('calcularDigitoVerificador resuelve los tres tipos de resultado', () => {
      expect(calcularDigitoVerificador('12345678')).toBe('5');
      expect(calcularDigitoVerificador('10000013')).toBe('K');
      expect(calcularDigitoVerificador('1000013')).toBe('0');
    });

    it('validarRun acepta RUN válidos con cualquier formato', () => {
      expect(validarRun('12.345.678-5')).toBeNull();
      expect(validarRun('12345678-5')).toBeNull();
      expect(validarRun('123456785')).toBeNull();
      expect(validarRun('10000013k')).toBeNull();
      expect(validarRun('10000130')).toBeNull();
    });

    it('validarRun rechaza un RUN vacío', () => {
      expect(validarRun('')).toBe('El RUN es obligatorio.');
    });

    it('validarRun rechaza un largo incorrecto', () => {
      expect(validarRun('123456')).toMatch(/entre 7 y 9 caracteres/);
      expect(validarRun('1234567890')).toMatch(/entre 7 y 9 caracteres/);
    });

    it('validarRun rechaza un cuerpo con letras', () => {
      expect(validarRun('1234A678-5')).toBe(
        'El RUN solo debe contener números y el dígito verificador.'
      );
    });

    it('validarRun rechaza un dígito verificador incorrecto', () => {
      expect(validarRun('12345678-9')).toBe('El RUN ingresado no es válido.');
    });
  });

  describe('contraseña', () => {
    it('validarContrasena acepta un largo dentro del rango', () => {
      expect(validarContrasena('abcdef')).toBeNull();
      expect(validarContrasena('a'.repeat(20))).toBeNull();
    });

    it('validarContrasena exige contraseña salvo que sea opcional', () => {
      expect(validarContrasena('')).toBe('La contraseña es obligatoria.');
      expect(validarContrasena('', { obligatoria: false })).toBeNull();
    });

    it('validarContrasena rechaza una contraseña muy corta o muy larga', () => {
      expect(validarContrasena('abc12')).toBe(
        'La contraseña debe tener entre 6 y 20 caracteres.'
      );
      expect(validarContrasena('a'.repeat(21))).toBe(
        'La contraseña debe tener entre 6 y 20 caracteres.'
      );
    });

    it('validarContrasena valida el largo aunque sea opcional, si se escribe algo', () => {
      expect(validarContrasena('abc', { obligatoria: false })).toMatch(/entre 6 y 20/);
    });

    it('validarConfirmacion acepta contraseñas iguales', () => {
      expect(validarConfirmacion('abcdef', 'abcdef')).toBeNull();
    });

    it('validarConfirmacion exige confirmar', () => {
      expect(validarConfirmacion('abcdef', '')).toBe('Debes confirmar la contraseña.');
    });

    it('validarConfirmacion rechaza contraseñas distintas', () => {
      expect(validarConfirmacion('abcdef', 'abcdeg')).toBe(
        'Las contraseñas no coinciden.'
      );
    });

    it('validarConfirmacion no exige nada si ambas están vacías y es opcional', () => {
      expect(validarConfirmacion('', '', { obligatoria: false })).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// 4. Servicio de personas (clientes y empleados)
// ---------------------------------------------------------------------------

describe('Servicio de personas', () => {
  describe('listado y filtros', () => {
    beforeEach(() => guardarUsuarios(copiaUsuarios()));

    it('listarPersonas separa clientes y empleados', () => {
      expect(listarPersonas('cliente').map((u) => u.nombre)).toEqual(['Ana', 'Luis']);
      expect(listarPersonas('empleado').map((u) => u.nombre)).toEqual([
        'Vera',
        'Carlos',
        'Demo',
      ]);
    });

    it('esDelTipo reconoce Empleado, Vendedor y Administrador como empleados', () => {
      expect(esDelTipo({ tipoUsuario: 'Cliente' }, 'cliente')).toBeTrue();
      expect(esDelTipo({ tipoUsuario: 'Cliente' }, 'empleado')).toBeFalse();
      ['Empleado', 'Vendedor', 'Administrador'].forEach((tipoUsuario) => {
        expect(esDelTipo({ tipoUsuario }, 'empleado')).toBeTrue();
      });
    });

    it('filtrarEmpleados agrupa Empleados y Vendedores en "Empleado"', () => {
      const empleados = listarPersonas('empleado');

      expect(filtrarEmpleados(empleados).length).toBe(3);
      expect(filtrarEmpleados(empleados, 'todos').length).toBe(3);
      expect(filtrarEmpleados(empleados, 'Administrador').map((e) => e.nombre)).toEqual([
        'Carlos',
      ]);
      expect(filtrarEmpleados(empleados, 'Empleado').map((e) => e.nombre)).toEqual([
        'Vera',
        'Demo',
      ]);
    });

    it('nombreCompleto, estadoDe y rolDe usan valores por defecto razonables', () => {
      expect(nombreCompleto({ nombre: 'Ana', apellidos: 'Torres' })).toBe('Ana Torres');
      expect(nombreCompleto({ nombre: 'Demo' })).toBe('Demo');
      expect(estadoDe({})).toBe('Activo');
      expect(estadoDe({ estado: 'Inactivo' })).toBe('Inactivo');
      expect(rolDe({ rol: 'Vendedor', tipoUsuario: 'Otro' })).toBe('Vendedor');
      expect(rolDe({ tipoUsuario: 'Administrador' })).toBe('Administrador');
    });

    it('la configuración tiene los textos de cliente y de empleado', () => {
      expect(CONFIG_PERSONAS.cliente.plural).toBe('Clientes');
      expect(CONFIG_PERSONAS.empleado.plural).toBe('Empleados');
      expect(ROLES_EMPLEADO).toEqual(['Vendedor', 'Administrador']);
    });
  });

  describe('validarPersona', () => {
    it('acepta un cliente válido y lo normaliza', () => {
      const resultado = validarPersona(DATOS_CLIENTE, { tipo: 'cliente' });

      expect(resultado.valido).toBeTrue();
      expect(resultado.errores).toEqual({});
      expect(resultado.persona).toEqual({
        run: '222222222',
        nombre: 'María',
        apellidos: 'Pérez Díaz',
        correo: 'maria@duoc.cl',
        tipoUsuario: 'Cliente',
        region: 'Valparaíso',
        comuna: 'Valparaíso',
        direccion: 'Av. España 123',
        password: 'abcdef',
      });
    });

    it('el tipo de usuario del empleado sale del rol elegido', () => {
      const vendedor = validarPersona(DATOS_EMPLEADO, { tipo: 'empleado' });
      const admin = validarPersona(
        { ...DATOS_EMPLEADO, rol: 'Administrador' },
        { tipo: 'empleado' }
      );

      expect(vendedor.persona.tipoUsuario).toBe('Vendedor');
      expect(vendedor.persona.rol).toBe('Vendedor');
      expect(admin.persona.tipoUsuario).toBe('Administrador');
      expect(admin.persona.rol).toBe('Administrador');
    });

    it('informa todos los campos obligatorios de un cliente vacío', () => {
      const resultado = validarPersona({}, { tipo: 'cliente' });

      expect(resultado.valido).toBeFalse();
      expect(resultado.persona).toBeNull();
      expect(Object.keys(resultado.errores).sort()).toEqual([
        'apellidos',
        'comuna',
        'confirmarContrasena',
        'contrasena',
        'correo',
        'direccion',
        'nombre',
        'region',
        'run',
      ]);
    });

    it('en un empleado vacío también exige el rol', () => {
      const resultado = validarPersona({}, { tipo: 'empleado' });

      expect(resultado.errores.rol).toBe('Debes seleccionar un rol o cargo.');
    });

    it('rechaza un rol que no es Vendedor ni Administrador', () => {
      const resultado = validarPersona(
        { ...DATOS_EMPLEADO, rol: 'Gerente' },
        { tipo: 'empleado' }
      );

      expect(resultado.errores.rol).toBe('El rol seleccionado no es válido.');
    });

    it('rechaza contraseñas que no coinciden', () => {
      const resultado = validarPersona(
        { ...DATOS_CLIENTE, confirmarContrasena: 'otra123' },
        { tipo: 'cliente' }
      );

      expect(resultado.errores.confirmarContrasena).toBe('Las contraseñas no coinciden.');
    });

    it('detecta un RUN duplicado al crear', () => {
      const resultado = validarPersona(
        { ...DATOS_CLIENTE, run: '12.345.678-5' },
        { tipo: 'cliente', existentes: copiaUsuarios() }
      );

      expect(resultado.errores.run).toBe('El RUN o Correo ya se encuentra registrado.');
      expect(resultado.errores.correo).toBe('El RUN o Correo ya se encuentra registrado.');
    });

    it('detecta un correo duplicado al crear', () => {
      const resultado = validarPersona(
        { ...DATOS_CLIENTE, correo: 'ANA@duoc.cl' },
        { tipo: 'cliente', existentes: copiaUsuarios() }
      );

      expect(resultado.errores.run).toBe('El RUN o Correo ya se encuentra registrado.');
    });

    it('al editar no valida el RUN ni exige contraseña', () => {
      const resultado = validarPersona(
        { ...DATOS_CLIENTE, run: '', contrasena: '', confirmarContrasena: '' },
        {
          tipo: 'cliente',
          modo: 'editar',
          existentes: copiaUsuarios(),
          claveOriginal: '123456785',
        }
      );

      expect(resultado.valido).toBeTrue();
      expect(resultado.persona.run).toBeUndefined();
      expect(resultado.persona.password).toBeUndefined();
    });

    it('al editar rechaza el correo de otro usuario pero permite el propio', () => {
      const opciones = {
        tipo: 'cliente',
        modo: 'editar',
        existentes: copiaUsuarios(),
        claveOriginal: '123456785',
      };
      const ajeno = validarPersona(
        { ...DATOS_CLIENTE, correo: 'luis@gmail.com', contrasena: '', confirmarContrasena: '' },
        opciones
      );
      const propio = validarPersona(
        { ...DATOS_CLIENTE, correo: 'ana@duoc.cl', contrasena: '', confirmarContrasena: '' },
        opciones
      );

      expect(ajeno.errores.correo).toBe('El RUN o Correo ya se encuentra registrado.');
      expect(propio.valido).toBeTrue();
    });

    it('al editar a un usuario sin RUN permite conservar su propio correo', () => {
      const resultado = validarPersona(
        {
          ...DATOS_EMPLEADO,
          correo: 'demo@duoc.cl',
          contrasena: '',
          confirmarContrasena: '',
        },
        {
          tipo: 'empleado',
          modo: 'editar',
          existentes: copiaUsuarios(),
          claveOriginal: 'demo@duoc.cl',
        }
      );

      expect(resultado.errores.correo).toBeUndefined();
      expect(resultado.valido).toBeTrue();
    });
  });

  describe('guardarPersona y borrarPersona', () => {
    beforeEach(() => guardarUsuarios(copiaUsuarios()));

    it('crea un cliente válido', () => {
      const resultado = guardarPersona(DATOS_CLIENTE, 'cliente');

      expect(resultado.ok).toBeTrue();
      expect(resultado.persona.run).toBe('222222222');
      expect(resultado.persona.tipoUsuario).toBe('Cliente');
      expect(resultado.persona.estado).toBe('Activo');
      expect(resultado.persona.fechaRegistro).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(usuariosGuardados().length).toBe(6);
    });

    it('crea un empleado con el rol elegido', () => {
      const resultado = guardarPersona(
        { ...DATOS_EMPLEADO, rol: 'Administrador' },
        'empleado'
      );

      expect(resultado.ok).toBeTrue();
      expect(resultado.persona.tipoUsuario).toBe('Administrador');
      expect(listarPersonas('empleado').length).toBe(4);
    });

    it('no guarda nada si los datos son inválidos', () => {
      const resultado = guardarPersona({ ...DATOS_CLIENTE, nombre: '' }, 'cliente');

      expect(resultado.ok).toBeFalse();
      expect(resultado.errores.nombre).toBeDefined();
      expect(usuariosGuardados().length).toBe(5);
    });

    it('rechaza un RUN que ya existe', () => {
      const resultado = guardarPersona(
        { ...DATOS_CLIENTE, run: '12345678-5' },
        'cliente'
      );

      expect(resultado.ok).toBeFalse();
      expect(usuariosGuardados().length).toBe(5);
    });

    it('edita conservando RUN, fecha de registro y contraseña si no se escribe una nueva', () => {
      const resultado = guardarPersona(
        {
          ...DATOS_CLIENTE,
          run: 'otro',
          correo: 'ana@duoc.cl',
          nombre: 'Ana María',
          contrasena: '',
          confirmarContrasena: '',
        },
        'cliente',
        '123456785'
      );
      const ana = usuariosGuardados()[0];

      expect(resultado.ok).toBeTrue();
      expect(ana.run).toBe('123456785');
      expect(ana.nombre).toBe('Ana María');
      expect(ana.fechaRegistro).toBe('2026-02-01');
      expect(ana.password).toBe('secreta1');
      expect(usuariosGuardados().length).toBe(5);
    });

    it('edita la contraseña cuando se escribe una nueva', () => {
      guardarPersona(
        {
          ...DATOS_CLIENTE,
          correo: 'ana@duoc.cl',
          contrasena: 'nueva123',
          confirmarContrasena: 'nueva123',
        },
        'cliente',
        '123456785'
      );

      expect(usuariosGuardados()[0].password).toBe('nueva123');
    });

    it('al cambiar el rol de un empleado cambia también su tipo de usuario', () => {
      guardarPersona(
        {
          ...DATOS_EMPLEADO,
          correo: 'vera@duoc.cl',
          rol: 'Administrador',
          contrasena: '',
          confirmarContrasena: '',
        },
        'empleado',
        '76543216'
      );

      expect(usuariosGuardados()[2].tipoUsuario).toBe('Administrador');
      expect(usuariosGuardados()[2].rol).toBe('Administrador');
    });

    it('edita a un empleado antiguo sin RUN usando su correo', () => {
      const resultado = guardarPersona(
        {
          ...DATOS_EMPLEADO,
          correo: 'demo@duoc.cl',
          contrasena: '',
          confirmarContrasena: '',
        },
        'empleado',
        'demo@duoc.cl'
      );
      const demo = usuariosGuardados()[4];

      expect(resultado.ok).toBeTrue();
      expect(demo.tipoUsuario).toBe('Vendedor');
      expect(demo.password).toBe('1234');
      expect(usuariosGuardados().length).toBe(5);
    });

    it('borrarPersona elimina a la persona', () => {
      borrarPersona('111111111');

      expect(listarPersonas('cliente').length).toBe(1);
    });

    it('borrarPersona falla si la persona no existe', () => {
      expect(() => borrarPersona('99999999')).toThrowError(
        'No existe el usuario que intentas eliminar.'
      );
    });
  });
});
