// Obtener el usuario autenticado (soporta ambas claves y estructuras)
function obtenerUsuarioAutenticado() {
  const usuarioJSON = localStorage.getItem("usuarioSesion") || localStorage.getItem("usuarioActivo");
  if (!usuarioJSON) return null;

  try {
    const usuario = JSON.parse(usuarioJSON);
    
    // Normalizar la propiedad del rol
    const rolDetectado = usuario.rol || usuario.tipoUsuario || "Cliente";
    
    return {
      ...usuario,
      rol: rolDetectado.trim()
    };
  } catch (e) {
    return null;
  }
}

// Proteger el acceso a las páginas evitando bucles
function protegerRuta(rolesPermitidos = []) {
  const usuario = obtenerUsuarioAutenticado();
  
  // Extraer el nombre del archivo HTML actual
  const path = window.location.pathname;
  const paginaActual = path.substring(path.lastIndexOf('/') + 1) || "index.html";

  // 1. Si no hay sesión iniciada
  if (!usuario) {
    if (paginaActual !== "login.html" && paginaActual !== "registro.html") {
      window.location.href = "login.html";
    }
    return;
  }

  // 2. Si hay roles especificados, verificar permisos
  if (rolesPermitidos.length > 0) {
    // Comparación insensible a mayúsculas/minúsculas
    const tienePermiso = rolesPermitidos.some(
      (r) => r.toLowerCase() === usuario.rol.toLowerCase()
    );

    if (!tienePermiso) {
      let destino = "index.html";

      if (usuario.rol.toLowerCase() === "vendedor") {
        destino = "adminProductos.html";
      } else if (usuario.rol.toLowerCase() === "administrador") {
        destino = "adminHome.html";
      }

      // PREVENCIÓN DE BUCLE: Redirigir solo si la ruta de destino es diferente a la actual
      if (paginaActual !== destino) {
        window.location.href = destino;
      }
    }
  }
}

// Adaptar la visibilidad del menú por rol
function adaptarMenuPorRol() {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) return;

  const elementosProtegidos = document.querySelectorAll("[data-roles]");

  elementosProtegidos.forEach((el) => {
    const rolesPermitidos = el.getAttribute("data-roles").split(",").map(r => r.trim().toLowerCase());
    if (!rolesPermitidos.includes(usuario.rol.toLowerCase())) {
      el.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  adaptarMenuPorRol();
});