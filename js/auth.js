// Obtener el usuario autenticado desde el almacenamiento local
function obtenerUsuarioAutenticado() {
  const usuarioJSON = localStorage.getItem("usuarioSesion");
  return usuarioJSON ? JSON.parse(usuarioJSON) : null;
}

// Proteger el acceso a las páginas según los roles permitidos
function protegerRuta(rolesPermitidos = []) {
  const usuario = obtenerUsuarioAutenticado();

  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
    if (usuario.rol === "Cliente") {
      window.location.href = "index.html";
    } else if (usuario.rol === "Vendedor") {
      // Redirige a la vista real de productos accesible por el Vendedor
      window.location.href = "adminProductos.html"; 
    } else {
      window.location.href = "adminHome.html";
    }
  }
}

// Ocultar o mostrar elementos del HTML (como enlaces del Sidebar) según el rol
function adaptarMenuPorRol() {
  const usuario = obtenerUsuarioAutenticado();
  if (!usuario) return;

  const elementosProtegidos = document.querySelectorAll("[data-roles]");

  elementosProtegidos.forEach((el) => {
    const rolesPermitidos = el.getAttribute("data-roles").split(",");
    if (!rolesPermitidos.includes(usuario.rol)) {
      el.style.display = "none";
    }
  });
}

// Ejecutar automáticamente al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  adaptarMenuPorRol();
});