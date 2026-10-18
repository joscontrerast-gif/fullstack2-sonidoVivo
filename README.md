# 🎸 Sonido Vivo Online

Aplicación frontend de una tienda online de instrumentos y equipos musicales, desarrollada como parte de la asignatura **DSY1104 — Desarrollo FullStack II**. Esta versión corresponde a la segunda entrega académica: migración del flujo principal de compra a **React**, incorporación de pruebas unitarias con **Jasmine y Karma**, y documentación del alcance y de los resultados de testing.

> **Alcance de esta entrega:** frontend React con catálogo basado en JSON y persistencia local del carrito. No se debe interpretar como una aplicación fullstack conectada a un backend o a una base de datos remota.

---

## 👥 Equipo de desarrollo

| Integrante     | Responsabilidad principal del proyecto                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Jose Contreras | Tienda principal: catálogo, búsqueda y filtros, detalle de producto, carrito y flujo de compra simulado |
| Matias Peña    | Módulo administrativo y mantenedores                                                                    |
| Sofia Caceres  | Vistas informativas, formularios y apoyo en estilos                                                     |

La distribución corresponde a la organización de trabajo del equipo; las funciones disponibles pueden variar según el módulo y la versión integrada en esta entrega.

---

## 🧰 Tecnologías

- **React**: construcción de la interfaz mediante componentes.
- **Vite**: servidor de desarrollo y compilación para producción.
- **React Router**: navegación entre vistas.
- **Bootstrap**: estilos y utilidades de diseño responsivo, donde están aplicados en la interfaz.
- **JavaScript**: lógica de la aplicación.
- **JSON**: fuente local de datos para el catálogo.
- **LocalStorage**: persistencia del carrito en el navegador.
- **Jasmine**: definición de pruebas automatizadas.
- **Karma**: ejecución de pruebas en navegador.
- **Webpack**: empaquetado del entorno de pruebas.
- **Chrome Headless**: navegador sin interfaz gráfica utilizado por Karma.

---

## 🛍️ Funcionalidades del frontend

### Catálogo

- Obtención de productos desde el archivo JSON servido por la aplicación.
- Visualización de los productos y de sus datos disponibles.
- Búsqueda de productos.
- Filtrado por categoría.
- Manejo de estados de carga y errores de obtención de datos.

### Detalle de producto

- Visualización de información del producto seleccionado.
- Validación de disponibilidad antes de agregarlo al carrito.

### Carrito de compras

- Agregar productos.
- Cambiar cantidades.
- Eliminar productos individuales o vaciar el carrito.
- Validar cantidades y disponibilidad según los datos disponibles.
- Conservar el carrito en `LocalStorage` al navegar entre vistas o recargar la página.

La clave de almacenamiento utilizada por el carrito es `carritoSonidoVivo`.

### Checkout

- Cálculo del subtotal.
- Selección de una opción de despacho y cálculo de su costo.
- Validaciones del carrito antes de confirmar.
- Simulación de la confirmación de compra.

**Importante:** el checkout es una simulación académica. Esta versión no procesa pagos reales ni registra pedidos en un backend remoto.

---

## 📁 Estructura relevante

La aplicación React se encuentra dentro de `frontend-react/`. Entre los archivos principales se encuentran:

```text
frontend-react/
├── public/
│   └── data/
│       └── productos.json
├── src/
│   ├── pages/
│   │   ├── DetalleProducto.jsx
│   │   ├── Carrito.jsx
│   │   └── Checkout.jsx
│   ├── services/
│   │   ├── productos.js
│   │   └── carrito.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── ...
```

La estructura anterior muestra los archivos principales relevantes para el flujo de compra; pueden existir otros componentes, estilos y archivos de prueba en el proyecto.

---

## ⚙️ Requisitos previos

- Node.js y npm instalados.
- Un navegador moderno, por ejemplo Google Chrome.
- Git, si se desea clonar el repositorio.

Para comprobar la instalación:

```bash
node --version
npm --version
```

---

## 🚀 Instalación y ejecución

Desde una terminal, entrar a la carpeta de la aplicación React:

```bash
cd frontend-react
```

Instalar las dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación en el navegador. Usualmente es `http://localhost:5173/`, pero se debe utilizar la URL exacta que indique la terminal.

### Compilar para producción

```bash
npm run build
```

Vite generará los archivos de producción en la carpeta `dist/`.

---

## 🧪 Pruebas unitarias

Las pruebas se ejecutan mediante Jasmine y Karma. Desde `frontend-react/`, ejecutar:

```bash
npm test
```

La última ejecución reportada por el equipo fue:

| Indicador                 | Resultado reportado |
| ------------------------- | ------------------: |
| Pruebas aprobadas         |            47 de 47 |
| Pruebas fallidas          |                   0 |
| Sentencias instrumentadas |        100% (40/40) |
| Ramas instrumentadas      |        100% (22/22) |
| Funciones instrumentadas  |        100% (10/10) |
| Líneas instrumentadas     |        100% (40/40) |

Las suites reportadas incluyen pruebas para `App`, `DetalleProducto`, `Carrito`, `Checkout` y servicios.

> **Nota sobre cobertura:** los porcentajes anteriores corresponden al código JavaScript de servicios incluido en la instrumentación de cobertura (`src/services/**/*.js`). No significan que el 100% de todos los componentes, páginas y archivos del frontend esté cubierto. Consultar el informe de cobertura de pruebas para conocer el alcance y las limitaciones de la medición.

La última ejecución compartida también indicó que `npm run build` finalizó correctamente. Los resultados pueden variar si el código o las dependencias cambian; se recomienda ejecutar ambos comandos antes de entregar.

---

## 📌 Alcance y limitaciones conocidas

Esta entrega se concentra en el frontend del flujo de compra. Los siguientes elementos no deben considerarse implementados por el solo hecho de estar descritos en el proyecto general:

- Backend Spring Boot o servicios REST conectados.
- Base de datos remota MySQL u otra base centralizada.
- Autenticación real y autorización segura por roles.
- Sincronización de inventario entre usuarios o dispositivos.
- Registro persistente de pedidos en un servidor.
- Procesamiento de pagos reales.

El catálogo utiliza datos locales y el carrito se almacena en el navegador. Por ello, el estado no se sincroniza automáticamente entre distintos dispositivos o navegadores.

---

## 📄 Documentación de la entrega

Junto al código fuente, la entrega académica contempla:

- **ERS actualizado:** especificación de requisitos ajustada al alcance de esta versión.
- **Informe de cobertura de pruebas:** alcance, resultados y limitaciones de la medición.
- **Repositorio público de GitHub:** código frontend actualizado.
- **Proyecto frontend comprimido:** versión actualizada de la carpeta del proyecto.

---

## 🎓 Proyecto académico

Desarrollado para **DSY1104 — Desarrollo FullStack II**, Escuela de Informática y Telecomunicaciones.

**Proyecto:** Sonido Vivo Online  
**Entrega:** Frontend React y pruebas unitarias
