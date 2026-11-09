package cl.sonidovivo.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 50, message = "El nombre admite hasta 50 caracteres") String nombre,
        @Size(max = 100, message = "Los apellidos admiten hasta 100 caracteres") String apellidos,
        @Size(max = 15, message = "El RUN no es válido") String run,
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es válido")
        @Size(max = 100, message = "El correo admite hasta 100 caracteres") String correo,
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 20, message = "La contraseña debe tener entre 6 y 20 caracteres") String password,
        Long idComuna,
        @Size(max = 300, message = "La dirección admite hasta 300 caracteres") String direccion) {
}
