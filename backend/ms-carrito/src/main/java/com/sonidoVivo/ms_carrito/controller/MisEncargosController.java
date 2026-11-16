package com.sonidoVivo.ms_carrito.controller;

import com.sonidoVivo.ms_carrito.dto.MiEncargoResponse;
import com.sonidoVivo.ms_carrito.security.AuthInterceptor;
import com.sonidoVivo.ms_carrito.service.MisEncargosService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/encargos")
public class MisEncargosController {

    private final MisEncargosService servicio;

    public MisEncargosController(MisEncargosService servicio) {
        this.servicio = servicio;
    }

    // Encargos del cliente autenticado (el id sale del JWT, nunca de la URL).
    @GetMapping("/mis")
    public List<MiEncargoResponse> misEncargos(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) Long usuarioId) {
        return servicio.listar(usuarioId);
    }
}
