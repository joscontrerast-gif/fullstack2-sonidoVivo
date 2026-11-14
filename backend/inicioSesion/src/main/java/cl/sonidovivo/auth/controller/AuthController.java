package cl.sonidovivo.auth.controller;

import cl.sonidovivo.auth.dto.LoginRequest;
import cl.sonidovivo.auth.dto.LoginResponse;
import cl.sonidovivo.auth.dto.RegistroRequest;
import cl.sonidovivo.auth.dto.UsuarioDto;
import cl.sonidovivo.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService servicio;

    public AuthController(AuthService servicio) {
        this.servicio = servicio;
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDto registro(@Valid @RequestBody RegistroRequest r) {
        return servicio.registrar(r);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest r) {
        return servicio.login(r);
    }

    @GetMapping("/me")
    public UsuarioDto me(@RequestHeader(value = "Authorization", required = false) String autorizacion) {
        return servicio.actual(autorizacion);
    }
}
