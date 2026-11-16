package com.sonidoVivo.ms_carrito.service;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

// Consultas de apoyo al checkout sobre tablas que este microservicio no administra
// (USUARIOS y COMUNAS) y sobre la secuencia de números de orden.
@Component
public class ConsultasCompra {

    private final JdbcTemplate jdbc;

    public ConsultasCompra(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // El formulario pide la comuna como texto; la base la guarda como referencia a la tabla COMUNAS.
    public Long buscarComuna(String nombre) {
        List<Long> ids = jdbc.queryForList(
                "SELECT id_comuna FROM comunas WHERE UPPER(nombre) = UPPER(?)", Long.class, nombre.trim());

        if (ids.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No reconocemos la comuna \"" + nombre.trim() + "\". Revisa que esté bien escrita.");
        }
        return ids.get(0);
    }

    // Nombre de la comuna de un encargo ya registrado (null si no tiene o no existe).
    public String nombreComuna(Long idComuna) {
        if (idComuna == null) return null;
        List<String> nombres = jdbc.queryForList(
                "SELECT nombre FROM comunas WHERE id_comuna = ?", String.class, idComuna);
        return nombres.isEmpty() ? null : nombres.get(0);
    }

    // Nombre completo y correo del cliente tal como están al momento de comprar.
    public Cliente buscarCliente(Long usuarioId) {
        List<Map<String, Object>> filas = jdbc.queryForList(
                "SELECT nombre, apellidos, correo FROM usuarios WHERE id_usuario = ?", usuarioId);

        if (filas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El usuario de la sesión ya no existe.");
        }
        Map<String, Object> fila = filas.get(0);

        return new Cliente((fila.get("NOMBRE") + " " + fila.get("APELLIDOS")).trim(),
                String.valueOf(fila.get("CORREO")));
    }

    // Mismo formato que el trigger de la base (ORD-001, ORD-002...), usando su secuencia.
    public String siguienteNumeroOrden() {
        Long numero = jdbc.queryForObject("SELECT seq_numero_orden.NEXTVAL FROM dual", Long.class);

        return String.format("ORD-%03d", numero);
    }

    public record Cliente(String nombre, String correo) {
    }
}
