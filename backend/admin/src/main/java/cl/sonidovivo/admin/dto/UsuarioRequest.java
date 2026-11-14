package cl.sonidovivo.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * tipo: Cliente, Vendedor o Administrador. estado: Activo o Inactivo (por defecto Activo).
 * La contraseña es obligatoria al crear y opcional al modificar.
 */
public record UsuarioRequest(
        @Size(max = 15, message = "El RUN no es válido") String run,
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 50, message = "El nombre admite hasta 50 caracteres") String nombre,
        @Size(max = 100, message = "Los apellidos admiten hasta 100 caracteres") String apellidos,
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no es válido")
        @Size(max = 100, message = "El correo admite hasta 100 caracteres") String correo,
        @Size(max = 20, message = "La contraseña admite hasta 20 caracteres") String password,
        @NotBlank(message = "El tipo de usuario es obligatorio") String tipo,
        Long idComuna,
        @Size(max = 300, message = "La dirección admite hasta 300 caracteres") String direccion,
        String estado) {
}
