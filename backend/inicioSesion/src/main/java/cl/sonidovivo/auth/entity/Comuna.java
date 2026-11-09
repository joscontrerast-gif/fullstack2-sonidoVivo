package cl.sonidovivo.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "comunas")
public class Comuna {

    @Id
    @Column(name = "id_comuna")
    private Long id;

    @Column(name = "id_region", nullable = false)
    private Long idRegion;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    public Long getId() { return id; }
    public Long getIdRegion() { return idRegion; }
    public String getNombre() { return nombre; }
}
