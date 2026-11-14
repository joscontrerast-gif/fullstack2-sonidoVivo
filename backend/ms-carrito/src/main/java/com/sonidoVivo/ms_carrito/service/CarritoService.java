package com.sonidoVivo.ms_carrito.service;

import com.sonidoVivo.ms_carrito.dto.ItemResponse;
import com.sonidoVivo.ms_carrito.model.ItemCarrito;
import com.sonidoVivo.ms_carrito.model.Producto;
import com.sonidoVivo.ms_carrito.repository.ItemCarritoRepository;
import com.sonidoVivo.ms_carrito.repository.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CarritoService {

    private final ItemCarritoRepository itemRepositorio;
    private final ProductoRepository productoRepositorio;

    public CarritoService(ItemCarritoRepository itemRepositorio, ProductoRepository productoRepositorio) {
        this.itemRepositorio = itemRepositorio;
        this.productoRepositorio = productoRepositorio;
    }

    // Mismo criterio que el frontend: los códigos de producto van en mayúsculas.
    static String normalizar(String codigo) {
        return codigo == null ? "" : codigo.trim().toUpperCase();
    }

    @Transactional(readOnly = true)
    public List<ItemResponse> listar(Long usuarioId) {
        return itemRepositorio.findByUsuarioIdOrderByIdAsc(usuarioId)
                .stream().map(ItemResponse::de).collect(Collectors.toList());
    }

    public List<ItemResponse> agregar(Long usuarioId, String codigo, int cantidad) {
        Producto producto = buscarProductoActivo(normalizar(codigo));

        ItemCarrito item = itemRepositorio
                .findByUsuarioIdAndProducto_Codigo(usuarioId, producto.getCodigo())
                .orElseGet(() -> new ItemCarrito(usuarioId, producto, 0));

        validarCantidad(item.getCantidad() + cantidad, producto);

        item.setCantidad(item.getCantidad() + cantidad);
        itemRepositorio.save(item);
        return listar(usuarioId);
    }

    public List<ItemResponse> cambiarCantidad(Long usuarioId, String codigo, int cantidad) {
        ItemCarrito item = itemRepositorio
                .findByUsuarioIdAndProducto_Codigo(usuarioId, normalizar(codigo))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado en el carrito."));

        validarCantidad(cantidad, item.getProducto());

        item.setCantidad(cantidad);
        itemRepositorio.save(item);
        return listar(usuarioId);
    }

    public List<ItemResponse> eliminar(Long usuarioId, String codigo) {
        itemRepositorio.findByUsuarioIdAndProducto_Codigo(usuarioId, normalizar(codigo))
                .ifPresent(itemRepositorio::delete);
        return listar(usuarioId);
    }

    public void vaciar(Long usuarioId) {
        itemRepositorio.deleteByUsuarioId(usuarioId);
    }

    private Producto buscarProductoActivo(String codigo) {
        return productoRepositorio.findByCodigo(codigo)
                .filter(Producto::estaActivo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "El producto no existe o no está disponible."));
    }

    private void validarCantidad(int cantidad, Producto producto) {
        int stock = producto.getStock();

        if (stock <= 0 || cantidad > stock) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    stock <= 0
                            ? "El producto está sin stock."
                            : "La cantidad debe estar entre 1 y " + stock + ".");
        }
    }
}
