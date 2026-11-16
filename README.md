# 🎸 Sonido Vivo Online

Aplicación web **FullStack** de una tienda online de instrumentos y equipos musicales, desarrollada como proyecto final de la asignatura **DSY1104 — Desarrollo FullStack II**. Integra un frontend desarrollado en **React** con una arquitectura de **microservicios en Spring Boot**, persistencia en **Oracle Cloud Database** mediante Oracle Wallet, autenticación basada en **JWT**, documentación interactiva con **Swagger UI** y pruebas unitarias automatizadas en frontend y backend.

---

## 👥 Equipo de desarrollo

| Integrante     | Responsabilidad principal del proyecto                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| Jose Contreras | Tienda principal: catálogo, búsqueda y filtros, detalle de producto, carrito, checkout e integración API      |
| Matias Peña    | Módulo administrativo, mantenedores de productos/encargos/personas y seguridad JWT                            |
| Sofia Caceres  | Vistas informativas (Inicio, Nosotros, Blogs, Contacto), formularios y diseño responsivo                      |

---

## 🏗️ Arquitectura y Tecnologías

### Frontend (`frontend-react/`)
- **React & Vite**: interfaz modular basada en componentes y servidor de desarrollo/compilación rápida.
- **React Router DOM**: enrutamiento público y protección de rutas administrativas por rol.
- **Bootstrap 5**: diseño responsivo y componentes de interfaz.
- **Fetch API & LocalStorage**: consumo de microservicios REST con envío de token Bearer JWT y respaldo local.
- **Jasmine, Karma, Testing Library & Chrome Headless**: suite de pruebas unitarias e instrumentación de cobertura.

### Backend (`backend/`)
- **Java & Spring Boot (4.1.2)**: arquitectura de 3 microservicios independientes con Maven Wrapper (`mvnw` / `mvnw.cmd`).
  - **`inicioSesion`**: registro de usuarios, inicio de sesión, emisión y validación de tokens **JWT**, y creación automática de usuario administrador inicial.
  - **`admin`**: gestión de catálogo de productos, control de stock crítico, administración de encargos y gestión de clientes/empleados.
  - **`ms-carrito`**: gestión del carrito de compras y procesamiento de órdenes/checkout.
- **Oracle Cloud Database (Autonomous DB)**: persistencia relacional conectada de forma segura mediante **Oracle Wallet** (`TNS_ADMIN`).
- **SpringDoc OpenAPI (Swagger UI)**: documentación interactiva de endpoints REST con soporte de autenticación **Bearer JWT**.

---

## 🛍️ Funcionalidades principales

### Tienda y experiencia de cliente
- **Inicio (`/`)**: portada principal con accesos destacados y categorías.
- **Catálogo (`/productos`)**: listado de productos con imágenes (`/img/productos/`), búsqueda en tiempo real (por nombre, marca, modelo o código) y filtro por categoría.
- **Detalle de producto (`/productos/:codigo`)**: ficha técnica completa, visualización de stock disponible y validación antes de agregar al carrito.
- **Carrito de compras (`/carrito`)**: ajuste de cantidades con validación de stock, eliminación de ítems, vaciado y cálculo de subtotales.
- **Checkout (`/checkout`)**: selección de despacho, validación de disponibilidad y confirmación de compra (`/compra-exitosa` y `/compra-fallida`).
- **Secciones informativas**: Nosotros (`/nosotros`), Blogs (`/blogs`, `/blogs/:id`) y Contacto (`/contacto`).

### Autenticación y Panel Administrativo (`/admin`)
- **Login (`/login`) y Registro (`/registro`)**: autenticación mediante JWT con control de acceso basado en roles (`ADMINISTRADOR` y `CLIENTE`).
- **Dashboard (`/admin`)**: resumen general de métricas del negocio.
- **Gestión de productos (`/admin/productos`)**: creación, edición, validación y eliminación de instrumentos con alerta visual de stock crítico.
- **Gestión de encargos (`/admin/encargos`)**: seguimiento y administración de pedidos realizados.
- **Gestión de personas (`/admin/clientes` y `/admin/empleados`)**: administración de cuentas registradas.

---

## 📁 Estructura del proyecto

```text
fullstack2-sonidoVivo/
├── backend/
│   ├── inicioSesion/                 # Microservicio de autenticación y usuarios (JWT)
│   ├── admin/                        # Microservicio de catálogo, inventario y administración
│   └── ms-carrito/                   # Microservicio de carrito y procesamiento de compras
├── frontend-react/
│   ├── public/
│   │   ├── data/
│   │   │   └── productos.json        # Respaldo de datos iniciales del catálogo
│   │   └── img/
│   │       └── productos/            # Imágenes estáticas del catálogo
│   ├── src/
│   │   ├── components/               # Componentes compartidos (Navbar, etc.)
│   │   ├── context/                  # AuthContext para manejo de sesión y roles JWT
│   │   ├── data/                     # Capa de acceso y utilidades de datos
│   │   ├── modules/
│   │   │   ├── admin/                # Páginas, componentes, servicios y tests del panel admin
│   │   │   └── compra/               # Flujo de compra exitosa/fallida y servicios
│   │   ├── pages/                    # Vistas públicas (Home, DetalleProducto, Carrito, Checkout, Login, etc.)
│   │   ├── services/                 # Clientes API (api.js, auth.js, productos.js, carrito.js)
│   │   ├── App.jsx                   # Definición de rutas y componente Catálogo
│   │   └── main.jsx                  # Punto de entrada de React
│   ├── karma.conf.cjs                # Configuración de Karma y cobertura
│   └── package.json
└── README.md
```

---

## ⚙️ Requisitos previos

- **Java JDK 17 o superior** (para ejecutar los microservicios Spring Boot).
- **Node.js y npm** (para ejecutar y compilar el frontend React).
- **Oracle Wallet** configurada en el entorno (`TNS_ADMIN`) para la conexión a Oracle Cloud Database.
- **Google Chrome** instalado (requerido por Karma / Chrome Headless para ejecutar las pruebas del frontend).

---

## 🚀 Instalación y ejecución

### 1. Ejecutar los microservicios Backend

Abre una terminal por cada microservicio (o ejecútalos secuencialmente) desde la raíz del proyecto:

```bash
# Microservicio de Autenticación (inicioSesion)
cd backend/inicioSesion
./mvnw spring-boot:run

# Microservicio Administrativo (admin)
cd backend/admin
./mvnw spring-boot:run

# Microservicio de Carrito (ms-carrito)
cd backend/ms-carrito
./mvnw spring-boot:run
```

*(En Windows PowerShell, utilizar `.\mvnw.cmd spring-boot:run`).*

#### Documentación Swagger UI y credenciales de prueba
Una vez levantados los servicios, cada microservicio expone su interfaz **Swagger UI** en `/swagger-ui.html` (por ejemplo, `http://localhost:8081/swagger-ui.html`, `http://localhost:8082/swagger-ui.html` y `http://localhost:8083/swagger-ui.html`).

- **Usuario Administrador por defecto:** `admin@sonidovivo.cl`
- **Contraseña:** `Admin1234`
- **Rol:** `ADMINISTRADOR`

Para probar endpoints protegidos en Swagger UI, inicia sesión en `inicioSesion`, copia el `token` JWT devuelto y ingrésalo en el botón **Authorize** de Swagger.

---

### 2. Ejecutar el Frontend React

En una nueva terminal, ingresa a `frontend-react/`:

```bash
cd frontend-react
npm install
npm run dev
```

Abre en el navegador la URL local indicada por Vite (habitualmente `http://localhost:5173/`).

#### Compilar para producción

```bash
npm run build
```

Genera los archivos optimizados para despliegue en `frontend-react/dist/`.

---

## 🧪 Pruebas unitarias y cobertura

### Frontend (Jasmine + Karma)

Desde `frontend-react/`, ejecutar:

```bash
npm test
```

Resultados obtenidos en la suite completa del frontend:

| Indicador                 | Resultado reportado |
| ------------------------- | ------------------: |
| Pruebas aprobadas         |          291 de 291 |
| Pruebas fallidas          |                   0 |
| Sentencias instrumentadas |     100% (456/456)  |
| Ramas instrumentadas      |     100% (431/431)  |
| Funciones instrumentadas  |     100% (107/107)  |
| Líneas instrumentadas     |     100% (437/437)  |

La suite cubre tanto los componentes y flujos de interfaz (`App`, `DetalleProducto`, `Carrito`, `Checkout`, `PanelAdmin`, `TablaProductos`, `FormularioProducto`, entre otros) como el **100% de los servicios instrumentados** (`adminService.js`, `encargosService.js`, `personasService.js`, `validaciones.js`, `compraService.js`, `api.js`, `auth.js`, `carrito.js` y `productos.js`).

### Backend (JUnit / Maven)

Para ejecutar las pruebas unitarias de los tres microservicios Spring Boot:

```bash
cd backend/inicioSesion && ./mvnw test
cd ../admin && ./mvnw test
cd ../ms-carrito && ./mvnw test
```

*(En Windows PowerShell, utilizar `.\mvnw.cmd test`).*

---

## 🎓 Proyecto académico

Desarrollado para **DSY1104 — Desarrollo FullStack II**, Escuela de Informática y Telecomunicaciones.

**Proyecto:** Sonido Vivo Online  
**Entrega:** Aplicación FullStack (React + Microservicios Spring Boot + Oracle Cloud + JWT + Testing)
