package cl.sonidovivo.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "regiones")
public class Region {

    @Id
    @Column(name = "id_region")
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
}
