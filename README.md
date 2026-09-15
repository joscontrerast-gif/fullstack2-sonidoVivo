# 🎸 Sonido Vivo Online

Plataforma web centralizada de comercio electrónico y gestión de inventario para la tienda de instrumentos musicales **Sonido Vivo**. Diseñada para digitalizar la venta de catálogo y el control de inventario, reemplazando procesos manuales mediante una interfaz web responsive, modular e intuitiva.

---

## 👥 Equipo de Desarrolladores

| Desarrollador | Módulos y Responsabilidades a Cargo |
| :--- | :--- |
| **Jose Contreras** | Tienda Principal, Catálogo y Carrito de Compras |
| **Matias Peña** | Módulo Administrador y Mantenedores (CRUD) |
| **Sofia Caceres** | Vistas Informativas, Formularios y Estilos CSS |

---

## ⚙️ Arquitectura y Tecnologías

El proyecto implementa una arquitectura web basada en estándares nativos del cliente (HTML5, CSS3 y JavaScript ES6+), utilizando persistencia de datos local y una estructuración semántica de archivos.

| Componente | Tecnología / Recurso Implementado |
| :--- | :--- |
| **Estructuración Semántica** | HTML5 (Formularios, vistas del administrador y catálogo) |
| **Estilos y Layout** | CSS3 (`css/styles.css` con Flexbox, Grid y diseño responsivo) |
| **Lógica y Dinamismo** | JavaScript ES6+ (Módulos independientes en carpeta `js/`) |
| **Persistencia de Datos** | Archivos estructurados JSON (`data/productos.json`) y LocalStorage |
| **Imágenes y Multimedia** | Recursos gráficos en formato JPEG (`img/`) |
| **Control de Versiones** | Git y GitHub |

---

## 📦 Estructura del Proyecto

```text
fullstack2-sonidoVivo-main/
├── css/
│   └── styles.css              # Estilos globales y maquetación de la plataforma
├── data/
│   └── productos.json          # Archivo de datos base para el catálogo
├── img/
│   ├── guitarra.jpeg           # Imágenes de productos e interfaz
│   └── InterfazDeAudio.jpeg
├── js/
│   ├── app.js                  # Inicialización y lógica general de la aplicación
│   ├── auth.js                 # Manejo de autenticación y sesiones
│   ├── cart.js                 # Lógica del carrito de compras
│   ├── checkout.js             # Proceso de pago y confirmación
│   ├── dashboardAdminHome.js   # Panel principal del administrador
│   ├── detalle.js              # Vista detallada de productos
│   ├── empleadoAdminForm.js    # Formulario CRUD de empleados
│   ├── listaEmpleados.js       # Mantenedor y listado de empleados
│   ├── listaEncargos.js        # Gestión de encargos/pedidos
│   ├── listaProductosAdmin.js  # Mantenedor e inventario de productos
│   ├── listaUsuarios.js        # Gestión de usuarios registrados
│   ├── productoForm.js         # Formulario de creación/edición de productos
│   ├── productos.js            # Filtros, catálogo y renderizado
│   ├── regiones.js             # Datos y selección de regiones/comunas
│   ├── usuarioForm.js          # Formulario CRUD de usuarios
│   └── validaciones.js         # Validaciones JS para formularios
├── adminEmpleadoForm.html      # Formulario para gestión de empleados
├── adminEmpleados.html         # Lista e interfaz de empleados
├── adminEncargos.html          # Control de encargos y despacho
├── adminHome.html              # Panel de control de administración
├── adminProductoForm.html      # Formulario para alta/edición de productos
├── adminProductos.html         # Mantenedor e inventario de catálogo
├── adminUsuarioForm.html       # Formulario para gestión de usuarios
├── adminUsuarios.html          # Lista e interfaz de usuarios
├── blog1.html                  # Artículos informativos y blogs
├── blog2.html
├── blogs.html
├── carrito.html                # Carrito de compras activo
├── checkout.html               # Formulario de finalización de compra
├── contacto.html               # Formulario de contacto
├── index.html                  # Página principal de la tienda
├── login.html                  # Pantalla de inicio de sesión
├── nosotros.html               # Vista informativa sobre la tienda
├── producto-detalle.html       # Ficha técnica del producto
├── productos.html              # Catálogo completo
├── registro.html               # Formulario de registro de clientes
└── README.md                   # Documentación general

🛡️ Resiliencia y Manejo Local de Datos

    Validación de Formulario Dinámica (js/validaciones.js): Intercepción síncrona en cliente para asegurar la integridad de datos en formularios de contacto, registro, inicio de sesión y mantenedores CRUD.

    Persistencia de Datos JSON / LocalStorage: Sincronización entre data/productos.json y el almacenamiento local del navegador para simular operaciones de inventario, adición al carrito y mantenimiento de sesiones.

    Control de Operaciones CRUD: Mantenedores divididos por entidad (empleados, productos, usuarios, encargos) que previenen borrados accidentales o registros vacíos.
