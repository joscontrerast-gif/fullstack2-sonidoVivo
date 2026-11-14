package cl.sonidovivo.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "roles")
public class Rol {

    @Id
    @Column(name = "id_rol")
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
}
