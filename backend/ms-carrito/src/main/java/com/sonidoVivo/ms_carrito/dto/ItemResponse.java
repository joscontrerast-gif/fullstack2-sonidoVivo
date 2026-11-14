package com.sonidoVivo.ms_carrito.dto;

import com.sonidoVivo.ms_carrito.model.ItemCarrito;
import com.sonidoVivo.ms_carrito.model.Producto;

// Incluye { codigo, cantidad } (lo que usa el frontend hoy) y los datos del producto
// para que el frontend ya no tenga que cruzarlos con el catálogo local.
public class ItemResponse {

    private final String codigo;
    private final String nombre;
    private final int precioUnitario;
    private final int cantidad;
    private final int stockDisponible;
    private final long subtotal;

    public ItemResponse(String codigo, String nombre, int precioUnitario, int cantidad, int stockDisponible) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.precioUnitario = precioUnitario;
        this.cantidad = cantidad;
        this.stockDisponible = stockDisponible;
        this.subtotal = (long) precioUnitario * cantidad;
    }

    public static ItemResponse de(ItemCarrito item) {
        Producto p = item.getProducto();
        return new ItemResponse(p.getCodigo(), p.getNombre(), p.getPrecio(), item.getCantidad(), p.getStock());
    }

    public String getCodigo() { return codigo; }
    public String getNombre() { return nombre; }
    public int getPrecioUnitario() { return precioUnitario; }
    public int getCantidad() { return cantidad; }
    public int getStockDisponible() { return stockDisponible; }
    public long getSubtotal() { return subtotal; }
}
