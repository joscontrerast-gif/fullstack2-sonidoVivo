package cl.sonidovivo.auth.dto;

public record LoginResponse(String token, String tipo, long expiraEnSegundos, UsuarioDto usuario) {
}
