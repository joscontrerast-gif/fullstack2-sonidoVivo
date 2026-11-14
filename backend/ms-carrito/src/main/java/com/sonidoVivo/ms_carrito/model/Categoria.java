package com.sonidoVivo.ms_carrito.model;

import jakarta.persistence.*;

// Tabla CATEGORIAS (diseño de la BD). El ms-carrito solo la lee.
@Entity
@Table(name = "categorias")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    protected Categoria() {
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
}
