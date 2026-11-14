package com.sonidoVivo.ms_carrito.controller;

import com.sonidoVivo.ms_carrito.dto.CantidadRequest;
import com.sonidoVivo.ms_carrito.dto.ItemRequest;
import com.sonidoVivo.ms_carrito.dto.ItemResponse;
import com.sonidoVivo.ms_carrito.security.AuthInterceptor;
import com.sonidoVivo.ms_carrito.service.CarritoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    private final CarritoService servicio;

    public CarritoController(CarritoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<ItemResponse> obtener(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) Long usuarioId) {
        return servicio.listar(usuarioId);
    }

    @PostMapping("/items")
    public List<ItemResponse> agregar(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) Long usuarioId,
            @Valid @RequestBody ItemRequest cuerpo) {
        int cantidad = cuerpo.getCantidad() == null ? 1 : cuerpo.getCantidad();
        return servicio.agregar(usuarioId, cuerpo.getCodigo(), cantidad);
    }

    @PutMapping("/items/{codigo}")
    public List<ItemResponse> cambiarCantidad(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) Long usuarioId,
            @PathVariable String codigo,
            @Valid @RequestBody CantidadRequest cuerpo) {
        return servicio.cambiarCantidad(usuarioId, codigo, cuerpo.getCantidad());
    }

    @DeleteMapping("/items/{codigo}")
    public List<ItemResponse> eliminar(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) Long usuarioId,
            @PathVariable String codigo) {
        return servicio.eliminar(usuarioId, codigo);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void vaciar(
            @RequestAttribute(AuthInterceptor.ATRIBUTO_USUARIO) Long usuarioId) {
        servicio.vaciar(usuarioId);
    }
}
