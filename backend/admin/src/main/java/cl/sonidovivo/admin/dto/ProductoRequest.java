package cl.sonidovivo.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** El código solo se usa al crear; al modificar se toma de la URL y no cambia. */
public record ProductoRequest(
        String codigo,
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre admite hasta 100 caracteres") String nombre,
        @NotBlank(message = "La categoría es obligatoria")
        @Size(max = 60, message = "La categoría admite hasta 60 caracteres") String categoria,
        @Size(max = 50, message = "La marca admite hasta 50 caracteres") String marca,
        @Size(max = 50, message = "El modelo admite hasta 50 caracteres") String modelo,
        @Size(max = 500, message = "La descripción admite hasta 500 caracteres") String descripcion,
        @NotNull(message = "El precio es obligatorio")
        @Min(value = 0, message = "El precio no puede ser negativo")
        @Max(value = 100000000, message = "El precio es demasiado alto") Integer precio,
        @NotNull(message = "El stock es obligatorio")
        @Min(value = 0, message = "El stock no puede ser negativo")
        @Max(value = 999999, message = "El stock es demasiado alto") Integer stock,
        @Min(value = 0, message = "El stock crítico no puede ser negativo")
        @Max(value = 999999, message = "El stock crítico es demasiado alto") Integer stockCritico,
        Boolean activo) {
}
