package com.sonidoVivo.ms_carrito.model;

import jakarta.persistence.*;

// Tabla NUEVA (no estaba en el diseño original): ITEMS_CARRITO.
// id_usuario referencia a USUARIOS.id_usuario (el id viene en el "sub" del JWT).
@Entity
@Table(
    name = "items_carrito",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_usuario", "id_producto"})
)
public class ItemCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_item")
    private Long id;

    @Column(name = "id_usuario", nullable = false)
    private Long usuarioId;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private int cantidad;

    protected ItemCarrito() {
    }

    public ItemCarrito(Long usuarioId, Producto producto, int cantidad) {
        this.usuarioId = usuarioId;
        this.producto = producto;
        this.cantidad = cantidad;
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public Producto getProducto() { return producto; }
    public int getCantidad() { return cantidad; }
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }
}
