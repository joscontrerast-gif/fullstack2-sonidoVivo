package com.sonidoVivo.ms_carrito.model;

import jakarta.persistence.*;

// Tabla DETALLE_ENCARGO. La columna SUBTOTAL es calculada por la base de datos, por eso no se mapea.
@Entity
@Table(name = "detalle_encargo")
public class DetalleEncargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_encargo", nullable = false)
    private Encargo encargo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    // Precio vigente al momento de la compra
    @Column(name = "precio_unitario", nullable = false)
    private Integer precioUnitario;

    protected DetalleEncargo() {
    }

    DetalleEncargo(Encargo encargo, Producto producto, int cantidad, int precioUnitario) {
        this.encargo = encargo;
        this.producto = producto;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }

    public Long getId() { return id; }
    public Encargo getEncargo() { return encargo; }
    public Producto getProducto() { return producto; }
    public Integer getCantidad() { return cantidad; }
    public Integer getPrecioUnitario() { return precioUnitario; }
}
