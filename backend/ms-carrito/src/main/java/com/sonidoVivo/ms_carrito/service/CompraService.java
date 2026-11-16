package com.sonidoVivo.ms_carrito.service;

import com.sonidoVivo.ms_carrito.dto.CompraRequest;
import com.sonidoVivo.ms_carrito.dto.CompraResponse;
import com.sonidoVivo.ms_carrito.model.Encargo;
import com.sonidoVivo.ms_carrito.model.ItemCarrito;
import com.sonidoVivo.ms_carrito.model.Producto;
import com.sonidoVivo.ms_carrito.repository.EncargoRepository;
import com.sonidoVivo.ms_carrito.repository.ItemCarritoRepository;
import com.sonidoVivo.ms_carrito.repository.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Map;

// Convierte el carrito guardado del usuario en un encargo: lo registra en Oracle, descuenta el stock
// y vacía el carrito. Todo ocurre en una sola transacción: si algo falla no queda nada a medias.
@Service
public class CompraService {

    // Mismos costos que muestra el frontend; el servidor es quien los aplica.
    static final Map<String, Integer> COSTOS_ENTREGA = Map.of("ESTANDAR", 1990, "EXPRESS", 4990, "RETIRO", 0);

    private final ItemCarritoRepository itemRepositorio;
    private final ProductoRepository productoRepositorio;
    private final EncargoRepository encargoRepositorio;
    private final ConsultasCompra consultas;

    public CompraService(ItemCarritoRepository itemRepositorio, ProductoRepository productoRepositorio,
                         EncargoRepository encargoRepositorio, ConsultasCompra consultas) {
        this.itemRepositorio = itemRepositorio;
        this.productoRepositorio = productoRepositorio;
        this.encargoRepositorio = encargoRepositorio;
        this.consultas = consultas;
    }

    @Transactional
    public CompraResponse confirmar(Long usuarioId, CompraRequest datos) {
        List<ItemCarrito> items = itemRepositorio.findByUsuarioIdOrderByIdAsc(usuarioId);

        if (items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tu carrito está vacío.");
        }

        String entrega = tipoEntrega(datos.getEntrega());
        Long idComuna = consultas.buscarComuna(datos.getComuna());
        ConsultasCompra.Cliente cliente = consultas.buscarCliente(usuarioId);

        Encargo encargo = new Encargo(
                consultas.siguienteNumeroOrden(),
                usuarioId,
                cliente.nombre(),
                cliente.correo(),
                entrega,
                COSTOS_ENTREGA.get(entrega),
                datos.getDireccion().trim(),
                idComuna);

        for (ItemCarrito item : items) {
            Producto producto = item.getProducto();
            int cantidad = item.getCantidad();

            if (!producto.estaActivo()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        producto.getNombre() + " ya no está disponible.");
            }
            if (productoRepositorio.descontarStock(producto.getId(), cantidad) == 0) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "No hay stock suficiente de " + producto.getNombre() + ".");
            }
            encargo.agregarDetalle(producto, cantidad);
        }

        Encargo guardado = encargoRepositorio.save(encargo);
        itemRepositorio.deleteByUsuarioId(usuarioId);
        return CompraResponse.de(guardado);
    }

    static String tipoEntrega(String valor) {
        String tipo = valor == null || valor.isBlank() ? "ESTANDAR" : valor.trim().toUpperCase(Locale.ROOT);

        if (!COSTOS_ENTREGA.containsKey(tipo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El tipo de entrega no es válido.");
        }
        return tipo;
    }
}
