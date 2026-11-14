package cl.sonidovivo.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "encargos")
public class Encargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_encargo")
    private Long id;

    @Column(name = "numero_orden", nullable = false)
    private String numeroOrden;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "cliente_nombre", nullable = false)
    private String clienteNombre;

    @Column(name = "cliente_correo", nullable = false)
    private String clienteCorreo;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "tipo_entrega", nullable = false)
    private String tipoEntrega;

    @Column(name = "costo_entrega", nullable = false)
    private Integer costoEntrega;

    @Column(name = "direccion_envio")
    private String direccionEnvio;

    @Column(name = "id_comuna_envio")
    private Long idComunaEnvio;

    @Column(name = "total", nullable = false)
    private Long total;

    @OneToMany(mappedBy = "encargo")
    private List<DetalleEncargo> detalles = new ArrayList<>();

    public Long getId() { return id; }
    public String getNumeroOrden() { return numeroOrden; }
    public Long getIdUsuario() { return idUsuario; }
    public String getClienteNombre() { return clienteNombre; }
    public String getClienteCorreo() { return clienteCorreo; }
    public LocalDateTime getFecha() { return fecha; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getTipoEntrega() { return tipoEntrega; }
    public Integer getCostoEntrega() { return costoEntrega; }
    public String getDireccionEnvio() { return direccionEnvio; }
    public Long getIdComunaEnvio() { return idComunaEnvio; }
    public Long getTotal() { return total; }
    public List<DetalleEncargo> getDetalles() { return detalles; }
}
