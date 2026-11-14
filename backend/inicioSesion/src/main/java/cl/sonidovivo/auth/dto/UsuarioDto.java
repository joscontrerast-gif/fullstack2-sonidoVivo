package cl.sonidovivo.auth.dto;

import cl.sonidovivo.auth.entity.Usuario;

public record UsuarioDto(Long id, String nombre, String apellidos, String correo, String rol, String tipoUsuario) {

    public static UsuarioDto de(Usuario u) {
        String rol = u.getRol().getNombre();
        String tipo = rol.substring(0, 1) + rol.substring(1).toLowerCase();
        return new UsuarioDto(u.getId(), u.getNombre(), u.getApellidos(), u.getCorreo(), rol, tipo);
    }
}
