package cl.sonidovivo.admin.dto;

import jakarta.validation.constraints.NotBlank;

/** estado: Pendiente, En Proceso, Completado o Cancelado (también acepta EN_PROCESO, etc.). */
public record CambioEstadoRequest(@NotBlank(message = "El estado es obligatorio") String estado) {
}
