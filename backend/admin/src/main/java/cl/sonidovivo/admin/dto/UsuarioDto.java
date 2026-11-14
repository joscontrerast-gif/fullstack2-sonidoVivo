package cl.sonidovivo.admin.dto;

import java.time.LocalDateTime;

public record UsuarioDto(Long id, String run, String nombre, String apellidos, String correo, String tipo,
                         Long idRegion, String region, Long idComuna, String comuna, String direccion,
                         String estado, LocalDateTime fechaRegistro) {
}
