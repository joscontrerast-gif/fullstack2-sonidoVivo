// Obtener el usuario autenticado desde localStorage
function obtenerUsuarioAutenticado() {
  const usuarioJSON = localStorage.getItem("usuarioSesion");
  try {
    return usuarioJSON ? JSON.parse(usuarioJSON) : null;
  } catch (e) {
    return null;
  }
}

// Proteger el acceso a las páginas según los roles permitidos
function protegerRuta(rolesPermitidos = []) {
  const usuario = obtenerUsuarioAutenticado();

  // 1. Si no hay usuario en sesión -> Login
  if (!usuario) {
    window.location.href = "login.html";
    return false;
  }

  // 2. Validar si el rol del usuario está permitido
  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
    // Redirigir según el rol real que tiene el usuario registrado
    switch (usuario.rol) {
      case "Cliente":
        window.location.href = "index.html";
        break;
      case "Vendedor":
        window.location.href = "adminProductos.html";
        break;
      default:
        window.location.href = "index.html";
        break;
    }
    return false;
  }
  return true;
}

// Ocultar elementos visuales del menú por rol
function adaptarMenuPorRol() {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) return;

  const elementosProtegidos = document.querySelectorAll("[data-roles]");

  elementosProtegidos.forEach((el) => {
    const rolesPermitidos = el.getAttribute("data-roles").split(",").map(r => r.trim());
    if (!rolesPermitidos.includes(usuario.rol)) {
      el.remove(); // Eliminamos el elemento del DOM en lugar de solo ocultarlo por CSS
    }
  });
}

// Ejecutar ocultamiento de menú al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  adaptarMenuPorRol();
});