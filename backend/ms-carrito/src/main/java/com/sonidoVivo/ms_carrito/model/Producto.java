package com.sonidoVivo.ms_carrito.model;

import jakarta.persistence.*;
import java.time.LocalDate;

// Tabla PRODUCTOS (diseño de la BD). El ms-carrito solo la lee: el CRUD lo hace el ms-admin.
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @Column(nullable = false)
    private String nombre;

    private String marca;

    private String modelo;

    private String descripcion;

    @Column(nullable = false)
    private Integer precio;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "stock_critico")
    private Integer stockCritico;

    @Column(name = "fecha_ingreso")
    private LocalDate fechaIngreso;

    // 1 = activo, 0 = inactivo
    @Column(nullable = false)
    private Integer activo;

    protected Producto() {
    }

    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public Categoria getCategoria() { return categoria; }
    public String getNombre() { return nombre; }
    public String getMarca() { return marca; }
    public String getModelo() { return modelo; }
    public String getDescripcion() { return descripcion; }
    public Integer getPrecio() { return precio; }
    public Integer getStock() { return stock; }
    public Integer getStockCritico() { return stockCritico; }
    public LocalDate getFechaIngreso() { return fechaIngreso; }
    public Integer getActivo() { return activo; }

    public boolean estaActivo() {
        return activo != null && activo == 1;
    }
}
