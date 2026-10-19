import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import {
  CLAVE_PRODUCTOS,
  URL_PRODUCTOS_INICIALES,
  actualizarProducto,
  codigoDe,
  crearProducto,
  eliminarProducto,
  guardarProductos,
  obtenerProductoPorCodigo,
  obtenerProductos,
  restablecerProductos,
} from '../../../data/productos.js';
import {
  borrarProducto,
  calcularResumen,
  esStockCritico,
  filtrarProductos,
  formatearPrecio,
  guardarProducto,
  listarProductos,
  obtenerCategorias,
  obtenerCategoriasFormulario,
  validarProducto,
} from '../services/adminService.js';
import TablaProductos from '../components/TablaProductos.jsx';
import FormularioProducto from '../components/FormularioProducto.jsx';
import PanelAdmin from '../pages/PanelAdmin.jsx';

// ---------------------------------------------------------------------------
// Datos de prueba
// ---------------------------------------------------------------------------

const PRODUCTOS_PRUEBA = [
  {
    codigo: 'GTR001',
    categoria: 'Guitarras Eléctricas',
    nombre: 'Stratocaster',
    marca: 'Fender',
    modelo: 'Player',
    stock: 5,
    stockCritico: 2,
    precio: 650000,
    descripcion: 'Guitarra de prueba',
    fechaIngreso: '2026-01-10',
  },
  {
    codigo: 'BAT001',
    categoria: 'Baterías',
    nombre: 'Stage Custom',
    marca: 'Yamaha',
    modelo: 'SBP',
    stock: 1,
    stockCritico: 2,
    precio: 850000,
    descripcion: 'Batería de prueba',
  },
  {
    codigo: 'ACC001',
    categoria: 'Accesorios',
    nombre: 'Cable Jack',
    marca: '',
    modelo: '',
    stock: 0,
    precio: 0,
    descripcion: '',
  },
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

const ETIQUETAS = {
  codigo: 'Código *',
  nombre: 'Nombre *',
  marca: 'Marca',
  modelo: 'Modelo',
  descripcion: 'Descripción',
  categoria: 'Categoría *',
  precio: 'Precio (CLP) *',
  stock: 'Stock *',
  stockCritico: 'Stock crítico',
};

function copiaProductos() {
  return JSON.parse(JSON.stringify(PRODUCTOS_PRUEBA));
}

function productosGuardados() {
  return JSON.parse(localStorage.getItem(CLAVE_PRODUCTOS));
}

function completarFormulario(valores) {
  Object.entries(valores).forEach(([campo, valor]) => {
    fireEvent.change(screen.getByLabelText(ETIQUETAS[campo]), {
      target: { value: valor },
    });
  });
}

// ---------------------------------------------------------------------------
// 1. Capa de datos (src/data/productos.js)
// ---------------------------------------------------------------------------

describe('Capa de datos de productos', () => {
  describe('obtenerProductos', () => {
    it('carga el catálogo inicial desde el JSON y lo guarda en localStorage', async () => {
      const fetchSpy = spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(copiaProductos()),
        })
      );

      const productos = await obtenerProductos();

      expect(fetchSpy).toHaveBeenCalledWith(URL_PRODUCTOS_INICIALES);
      expect(productos.length).toBe(3);
      expect(productosGuardados().length).toBe(3);
    });

    it('usa los datos de localStorage sin volver a pedir el JSON', async () => {
      guardarProductos(copiaProductos());
      const fetchSpy = spyOn(window, 'fetch');

      const productos = await obtenerProductos();

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(productos.length).toBe(3);
    });

    it('vuelve a cargar el JSON si lo guardado está corrupto', async () => {
      localStorage.setItem(CLAVE_PRODUCTOS, 'esto no es json');
      const fetchSpy = spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(copiaProductos()),
        })
      );

      const productos = await obtenerProductos();

      expect(fetchSpy).toHaveBeenCalled();
      expect(productos.length).toBe(3);
    });

    it('falla con un mensaje claro si el JSON no se puede descargar', async () => {
      spyOn(window, 'fetch').and.returnValue(Promise.resolve({ ok: false }));

      await expectAsync(obtenerProductos()).toBeRejectedWithError(
        'No se pudieron cargar los productos'
      );
    });
  });

  describe('obtenerProductoPorCodigo', () => {
    beforeEach(() => guardarProductos(copiaProductos()));

    it('encuentra un producto sin distinguir mayúsculas', async () => {
      const producto = await obtenerProductoPorCodigo('gtr001');

      expect(producto.nombre).toBe('Stratocaster');
    });

    it('devuelve null si el producto no existe', async () => {
      expect(await obtenerProductoPorCodigo('NOEXISTE')).toBeNull();
    });
  });

  describe('crearProducto', () => {
    beforeEach(() => guardarProductos(copiaProductos()));

    it('agrega el producto con código normalizado y fecha de ingreso', async () => {
      const nuevo = await crearProducto({
        codigo: ' mic001 ',
        nombre: 'Micrófono',
      });

      expect(nuevo.codigo).toBe('MIC001');
      expect(nuevo.fechaIngreso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(productosGuardados().length).toBe(4);
    });

    it('rechaza un código repetido sin importar mayúsculas', async () => {
      await expectAsync(
        crearProducto({ codigo: 'gtr001', nombre: 'Repetido' })
      ).toBeRejectedWithError(/Ya existe un producto/);

      expect(productosGuardados().length).toBe(3);
    });

    it('rechaza un producto sin código', async () => {
      await expectAsync(
        crearProducto({ nombre: 'Sin código' })
      ).toBeRejectedWithError('El producto debe tener un código.');
    });
  });

  describe('actualizarProducto', () => {
    beforeEach(() => guardarProductos(copiaProductos()));

    it('modifica los datos pero conserva el código y la fecha de ingreso', async () => {
      const actualizado = await actualizarProducto('gtr001', {
        nombre: 'Stratocaster II',
        precio: 700000,
        codigo: 'OTRO',
        fechaIngreso: '2000-01-01',
      });

      expect(actualizado.nombre).toBe('Stratocaster II');
      expect(actualizado.precio).toBe(700000);
      expect(actualizado.codigo).toBe('GTR001');
      expect(actualizado.fechaIngreso).toBe('2026-01-10');
      expect(productosGuardados()[0].nombre).toBe('Stratocaster II');
    });

    it('falla si el producto no existe', async () => {
      await expectAsync(
        actualizarProducto('NOEXISTE', { nombre: 'X' })
      ).toBeRejectedWithError(/No existe un producto/);
    });
  });

  describe('eliminarProducto', () => {
    beforeEach(() => guardarProductos(copiaProductos()));

    it('elimina el producto indicado y devuelve el eliminado', async () => {
      const eliminado = await eliminarProducto('bat001');

      expect(eliminado.codigo).toBe('BAT001');
      expect(productosGuardados().length).toBe(2);
      expect(await obtenerProductoPorCodigo('BAT001')).toBeNull();
    });

    it('falla si el producto no existe', async () => {
      await expectAsync(
        eliminarProducto('NOEXISTE')
      ).toBeRejectedWithError(/No existe un producto/);
    });
  });

  it('restablecerProductos borra los datos guardados', () => {
    guardarProductos(copiaProductos());

    restablecerProductos();

    expect(localStorage.getItem(CLAVE_PRODUCTOS)).toBeNull();
  });

  it('codigoDe acepta productos antiguos que usan "sku"', () => {
    expect(codigoDe({ sku: ' ab1 ' })).toBe('ab1');
    expect(codigoDe({ codigo: 'GA001', sku: 'otro' })).toBe('GA001');
    expect(codigoDe(null)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// 2. Servicio administrativo (validaciones y operaciones)
// ---------------------------------------------------------------------------

describe('Servicio administrativo', () => {
  describe('validarProducto', () => {
    it('acepta datos válidos y los normaliza', () => {
      const resultado = validarProducto(DATOS_VALIDOS);

      expect(resultado.valido).toBeTrue();
      expect(resultado.errores).toEqual({});
      expect(resultado.producto).toEqual({
        codigo: 'TEC001',
        nombre: 'Teclado Casio',
        marca: 'Casio',
        modelo: 'CT-S1',
        descripcion: '',
        categoria: 'Teclados y Pianos',
        precio: 250000,
        stock: 4,
        stockCritico: null,
      });
    });

    it('acepta precio 0 y stock crítico informado', () => {
      const resultado = validarProducto({
        ...DATOS_VALIDOS,
        precio: '0',
        stockCritico: '2',
      });

      expect(resultado.valido).toBeTrue();
      expect(resultado.producto.precio).toBe(0);
      expect(resultado.producto.stockCritico).toBe(2);
    });

    const CASOS_INVALIDOS = [
      ['un código muy corto', { codigo: 'ab' }, 'codigo', /al menos 3/],
      ['un código muy largo', { codigo: 'A'.repeat(21) }, 'codigo', /no puede superar/],
      ['un código con caracteres inválidos', { codigo: 'ab c$' }, 'codigo', /letras, números y guiones/],
      ['un nombre vacío', { nombre: '   ' }, 'nombre', /obligatorio/],
      ['un nombre demasiado largo', { nombre: 'N'.repeat(101) }, 'nombre', /100/],
      ['una marca demasiado larga', { marca: 'M'.repeat(51) }, 'marca', /50/],
      ['un modelo demasiado largo', { modelo: 'M'.repeat(51) }, 'modelo', /50/],
      ['una descripción demasiado larga', { descripcion: 'D'.repeat(501) }, 'descripcion', /500/],
      ['una categoría vacía', { categoria: '' }, 'categoria', /categoría/],
      ['un precio vacío', { precio: '' }, 'precio', /obligatorio/],
      ['un precio negativo', { precio: '-1' }, 'precio', /mayor o igual a 0/],
      ['un precio no numérico', { precio: 'abc' }, 'precio', /obligatorio/],
      ['un stock vacío', { stock: '' }, 'stock', /entero/],
      ['un stock decimal', { stock: '2.5' }, 'stock', /entero/],
      ['un stock negativo', { stock: '-3' }, 'stock', /entero/],
      ['un stock crítico decimal', { stockCritico: '1.5' }, 'stockCritico', /entero/],
      ['un stock crítico negativo', { stockCritico: '-1' }, 'stockCritico', /entero/],
    ];

    CASOS_INVALIDOS.forEach(([descripcion, cambio, campo, patron]) => {
      it(`rechaza ${descripcion}`, () => {
        const resultado = validarProducto({ ...DATOS_VALIDOS, ...cambio });

        expect(resultado.valido).toBeFalse();
        expect(resultado.producto).toBeNull();
        expect(resultado.errores[campo]).toMatch(patron);
      });
    });

    it('informa todos los campos obligatorios cuando el formulario está vacío', () => {
      const resultado = validarProducto({});

      expect(Object.keys(resultado.errores).sort()).toEqual([
        'categoria',
        'codigo',
        'nombre',
        'precio',
        'stock',
      ]);
    });

    it('detecta un código duplicado al crear', () => {
      const resultado = validarProducto(
        { ...DATOS_VALIDOS, codigo: 'gtr001' },
        { productosExistentes: copiaProductos() }
      );

      expect(resultado.errores.codigo).toMatch(/Ya existe un producto/);
    });

    it('no revisa el código al editar, porque no se puede cambiar', () => {
      const resultado = validarProducto(
        { ...DATOS_VALIDOS, codigo: 'GTR001' },
        { modo: 'editar', productosExistentes: copiaProductos() }
      );

      expect(resultado.valido).toBeTrue();
    });
  });

  describe('operaciones del panel', () => {
    beforeEach(() => guardarProductos(copiaProductos()));

    it('listarProductos devuelve los productos guardados', async () => {
      expect((await listarProductos()).length).toBe(3);
    });

    it('guardarProducto crea un producto válido', async () => {
      const resultado = await guardarProducto(DATOS_VALIDOS);

      expect(resultado.ok).toBeTrue();
      expect(resultado.producto.codigo).toBe('TEC001');
      expect(productosGuardados().length).toBe(4);
    });

    it('guardarProducto no guarda nada si los datos son inválidos', async () => {
      const resultado = await guardarProducto({ ...DATOS_VALIDOS, nombre: '' });

      expect(resultado.ok).toBeFalse();
      expect(resultado.errores.nombre).toBeDefined();
      expect(productosGuardados().length).toBe(3);
    });

    it('guardarProducto rechaza un código que ya existe', async () => {
      const resultado = await guardarProducto({
        ...DATOS_VALIDOS,
        codigo: 'bat001',
      });

      expect(resultado.ok).toBeFalse();
      expect(resultado.errores.codigo).toMatch(/Ya existe/);
      expect(productosGuardados().length).toBe(3);
    });

    it('guardarProducto edita sin permitir cambiar el código', async () => {
      const resultado = await guardarProducto(
        {
          ...DATOS_VALIDOS,
          codigo: 'IGNORADO',
          nombre: 'Stratocaster II',
          categoria: 'Guitarras Eléctricas',
        },
        'GTR001'
      );

      const guardados = productosGuardados();

      expect(resultado.ok).toBeTrue();
      expect(guardados.length).toBe(3);
      expect(guardados[0].codigo).toBe('GTR001');
      expect(guardados[0].nombre).toBe('Stratocaster II');
      expect(guardados[0].fechaIngreso).toBe('2026-01-10');
      expect(guardados.some((p) => p.codigo === 'IGNORADO')).toBeFalse();
    });

    it('borrarProducto elimina el producto', async () => {
      await borrarProducto('ACC001');

      expect(productosGuardados().length).toBe(2);
    });
  });

  describe('helpers', () => {
    it('esStockCritico compara el stock con el stock crítico', () => {
      expect(esStockCritico(PRODUCTOS_PRUEBA[0])).toBeFalse();
      expect(esStockCritico(PRODUCTOS_PRUEBA[1])).toBeTrue();
      expect(esStockCritico(PRODUCTOS_PRUEBA[2])).toBeFalse();
      expect(esStockCritico({ stock: 2, stockCritico: 2 })).toBeTrue();
      expect(esStockCritico({ stock: 2, stockCritico: null })).toBeFalse();
    });

    it('formatearPrecio muestra FREE para 0 y pesos chilenos en otro caso', () => {
      expect(formatearPrecio(0)).toBe('FREE');
      expect(formatearPrecio(129990)).toMatch(/129\.990/);
    });

    it('obtenerCategorias lista las categorías existentes ordenadas', () => {
      expect(obtenerCategorias(PRODUCTOS_PRUEBA)).toEqual([
        'Accesorios',
        'Baterías',
        'Guitarras Eléctricas',
      ]);
    });

    it('obtenerCategoriasFormulario une las base con las existentes sin repetir', () => {
      const categorias = obtenerCategoriasFormulario([
        ...PRODUCTOS_PRUEBA,
        { codigo: 'X', categoria: 'Otra categoría' },
      ]);

      expect(categorias).toContain('Teclados y Pianos');
      expect(categorias).toContain('Otra categoría');
      expect(categorias.length).toBe(new Set(categorias).size);
      expect(categorias.length).toBe(11);
    });

    it('filtrarProductos filtra por categoría y por texto', () => {
      const todos = PRODUCTOS_PRUEBA;
      const codigos = (lista) => lista.map((p) => p.codigo);

      expect(codigos(filtrarProductos(todos))).toEqual([
        'GTR001',
        'BAT001',
        'ACC001',
      ]);
      expect(
        codigos(filtrarProductos(todos, { categoria: 'Baterías' }))
      ).toEqual(['BAT001']);
      expect(codigos(filtrarProductos(todos, { busqueda: 'FENDER' }))).toEqual([
        'GTR001',
      ]);
      expect(codigos(filtrarProductos(todos, { busqueda: 'acc001' }))).toEqual([
        'ACC001',
      ]);
      expect(
        filtrarProductos(todos, { categoria: 'Baterías', busqueda: 'fender' })
          .length
      ).toBe(0);
    });

    it('calcularResumen cuenta total, stock crítico y sin stock', () => {
      expect(calcularResumen(PRODUCTOS_PRUEBA)).toEqual({
        total: 3,
        criticos: 1,
        sinStock: 1,
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 3. Componentes
// ---------------------------------------------------------------------------

describe('TablaProductos', () => {
  it('muestra una fila por producto con sus datos', () => {
    render(
      <TablaProductos
        productos={copiaProductos()}
        onEditar={() => {}}
        onEliminar={() => {}}
      />
    );

    expect(screen.getAllByRole('row').length).toBe(4); // encabezado + 3
    expect(screen.getByText('Fender Stratocaster')).toBeTruthy();
    expect(screen.getByText('GTR001')).toBeTruthy();
    expect(screen.getByText('Cable Jack')).toBeTruthy();
    expect(screen.getByText('FREE')).toBeTruthy();
  });

  it('marca con una alerta solo los productos con stock crítico', () => {
    render(
      <TablaProductos
        productos={copiaProductos()}
        onEditar={() => {}}
        onEliminar={() => {}}
      />
    );

    expect(
      screen.getAllByRole('img', { name: 'Alerta de stock crítico' }).length
    ).toBe(1);
  });

  it('muestra un mensaje cuando no hay productos', () => {
    render(
      <TablaProductos productos={[]} onEditar={() => {}} onEliminar={() => {}} />
    );

    expect(screen.getByText('No hay productos para mostrar.')).toBeTruthy();
  });

  it('avisa cuál producto se quiere editar o eliminar', () => {
    const onEditar = jasmine.createSpy('onEditar');
    const onEliminar = jasmine.createSpy('onEliminar');

    render(
      <TablaProductos
        productos={copiaProductos()}
        onEditar={onEditar}
        onEliminar={onEliminar}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar BAT001' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar ACC001' }));

    expect(onEditar).toHaveBeenCalledWith(
      jasmine.objectContaining({ codigo: 'BAT001' })
    );
    expect(onEliminar).toHaveBeenCalledWith(
      jasmine.objectContaining({ codigo: 'ACC001' })
    );
  });
});

describe('FormularioProducto', () => {
  const CATEGORIAS = ['Accesorios', 'Baterías', 'Teclados y Pianos'];

  function renderizarFormulario(props = {}) {
    const onGuardar =
      props.onGuardar ||
      jasmine
        .createSpy('onGuardar')
        .and.callFake(() => Promise.resolve({ ok: true, errores: {} }));
    const onCancelar = props.onCancelar || jasmine.createSpy('onCancelar');

    render(
      <FormularioProducto
        categorias={CATEGORIAS}
        productoInicial={props.productoInicial}
        onGuardar={onGuardar}
        onCancelar={onCancelar}
      />
    );

    return { onGuardar, onCancelar };
  }

  it('envía los valores escritos al guardar un producto nuevo', async () => {
    const { onGuardar } = renderizarFormulario();

    completarFormulario({
      codigo: 'tec001',
      nombre: 'Teclado Casio',
      categoria: 'Teclados y Pianos',
      precio: '250000',
      stock: '4',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => expect(onGuardar).toHaveBeenCalled());

    expect(onGuardar).toHaveBeenCalledWith(
      jasmine.objectContaining({
        codigo: 'tec001',
        nombre: 'Teclado Casio',
        categoria: 'Teclados y Pianos',
        precio: '250000',
        stock: '4',
      })
    );
  });

  it('muestra los errores de validación que recibe y marca el campo', async () => {
    renderizarFormulario({
      onGuardar: () =>
        Promise.resolve({ ok: false, errores: { nombre: 'Nombre de prueba inválido' } }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByText('Nombre de prueba inválido')).toBeTruthy();
    expect(
      screen.getByLabelText('Nombre *').getAttribute('aria-invalid')
    ).toBe('true');
  });

  it('quita el error de un campo cuando el usuario lo corrige', async () => {
    renderizarFormulario({
      onGuardar: () =>
        Promise.resolve({ ok: false, errores: { nombre: 'Nombre de prueba inválido' } }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));
    await screen.findByText('Nombre de prueba inválido');

    completarFormulario({ nombre: 'Corregido' });

    expect(screen.queryByText('Nombre de prueba inválido')).toBeNull();
  });

  it('muestra un error general si guardar falla', async () => {
    renderizarFormulario({
      onGuardar: () => Promise.reject(new Error('Fallo de almacenamiento')),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByText('Fallo de almacenamiento')).toBeTruthy();
  });

  it('en edición precarga los datos y bloquea el código', () => {
    renderizarFormulario({ productoInicial: copiaProductos()[0] });

    expect(screen.getByLabelText('Código *').value).toBe('GTR001');
    expect(screen.getByLabelText('Código *').readOnly).toBeTrue();
    expect(screen.getByLabelText('Nombre *').value).toBe('Stratocaster');
    expect(screen.getByLabelText('Stock crítico').value).toBe('2');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeTruthy();
  });

  it('el botón Cancelar avisa al componente padre', () => {
    const { onCancelar } = renderizarFormulario();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancelar).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 4. Panel administrativo (flujo completo)
// ---------------------------------------------------------------------------

describe('PanelAdmin', () => {
  function renderizarPanel() {
    return render(
      <MemoryRouter>
        <PanelAdmin />
      </MemoryRouter>
    );
  }

  beforeEach(() => {
    guardarProductos(copiaProductos());
  });

  it('muestra el resumen y el listado de productos', async () => {
    renderizarPanel();

    expect(await screen.findByText('Fender Stratocaster')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Productos' })).toBeTruthy();
    expect(screen.getByTestId('resumen-total').textContent).toBe('3');
    expect(screen.getByTestId('resumen-criticos').textContent).toBe('1');
    expect(screen.getByTestId('resumen-sin-stock').textContent).toBe('1');
  });

  it('informa el error si no se pueden cargar los productos', async () => {
    localStorage.clear();
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({ ok: false }));

    renderizarPanel();

    expect(
      await screen.findByText(/No se pudieron cargar los productos/)
    ).toBeTruthy();
  });

  it('crea un producto nuevo desde el formulario', async () => {
    renderizarPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Nuevo producto' }));
    completarFormulario({
      codigo: 'tec001',
      nombre: 'Teclado Casio',
      categoria: 'Teclados y Pianos',
      precio: '250000',
      stock: '4',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByText('Producto creado con éxito.')).toBeTruthy();
    expect(screen.getByText('Teclado Casio')).toBeTruthy();
    expect(screen.getByTestId('resumen-total').textContent).toBe('4');
    expect(productosGuardados().some((p) => p.codigo === 'TEC001')).toBeTrue();
  });

  it('valida el formulario y no guarda si faltan datos', async () => {
    renderizarPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Nuevo producto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeTruthy();
    expect(screen.getByText('Debes seleccionar una categoría.')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Nuevo producto' })).toBeTruthy();
    expect(productosGuardados().length).toBe(3);
  });

  it('no permite crear un producto con un código repetido', async () => {
    renderizarPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Nuevo producto' }));
    completarFormulario({
      codigo: 'gtr001',
      nombre: 'Otra guitarra',
      categoria: 'Guitarras Eléctricas',
      precio: '1000',
      stock: '1',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear producto' }));

    expect(
      await screen.findByText('Ya existe un producto con el código "GTR001".')
    ).toBeTruthy();
    expect(productosGuardados().length).toBe(3);
  });

  it('edita un producto existente', async () => {
    renderizarPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Editar GTR001' }));

    expect(await screen.findByRole('heading', { name: 'Editar producto' })).toBeTruthy();

    completarFormulario({ nombre: 'Stratocaster II' });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Producto actualizado con éxito.')).toBeTruthy();
    expect(screen.getByText('Fender Stratocaster II')).toBeTruthy();
    expect(productosGuardados()[0].nombre).toBe('Stratocaster II');
  });

  it('elimina un producto solo después de confirmar', async () => {
    renderizarPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar BAT001' }));

    expect(screen.getByText(/¿Eliminar el producto/)).toBeTruthy();
    expect(productosGuardados().length).toBe(3);

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación' }));

    expect(await screen.findByText('Producto eliminado con éxito.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Eliminar BAT001' })).toBeNull();
    expect(productosGuardados().length).toBe(2);
  });

  it('no elimina nada si se cancela la confirmación', async () => {
    renderizarPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar BAT001' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar eliminación' }));

    expect(screen.queryByText(/¿Eliminar el producto/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Eliminar BAT001' })).toBeTruthy();
    expect(productosGuardados().length).toBe(3);
  });

  it('filtra el listado por categoría', async () => {
    renderizarPanel();
    await screen.findByText('Fender Stratocaster');

    fireEvent.change(screen.getByLabelText('Filtrar por categoría'), {
      target: { value: 'Baterías' },
    });

    expect(screen.queryByRole('button', { name: 'Editar GTR001' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Editar BAT001' })).toBeTruthy();
  });

  it('busca productos por texto', async () => {
    renderizarPanel();
    await screen.findByText('Fender Stratocaster');

    fireEvent.change(screen.getByLabelText('Buscar producto'), {
      target: { value: 'cable' },
    });

    expect(screen.queryByRole('button', { name: 'Editar GTR001' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Editar ACC001' })).toBeTruthy();
  });

  it('cancelar el formulario vuelve al listado sin guardar', async () => {
    renderizarPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Nuevo producto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('button', { name: 'Nuevo producto' })).toBeTruthy();
    expect(productosGuardados().length).toBe(3);
  });
});
