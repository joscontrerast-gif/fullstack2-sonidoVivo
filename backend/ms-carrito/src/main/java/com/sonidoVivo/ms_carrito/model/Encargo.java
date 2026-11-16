package com.sonidoVivo.ms_carrito.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Tabla ENCARGOS (pedidos). El ms-carrito la crea al confirmar la compra; el ms-admin la consulta
// y cambia su estado desde el panel de administración.
@Entity
@Table(name = "encargos")
public class Encargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_encargo")
    private Long id;

    @Column(name = "numero_orden", nullable = false, length = 12)
    private String numeroOrden;

    @Column(name = "id_usuario")
    private Long usuarioId;

    @Column(name = "cliente_nombre", nullable = false)
    private String clienteNombre;

    @Column(name = "cliente_correo", nullable = false)
    private String clienteCorreo;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    // PENDIENTE | EN_PROCESO | COMPLETADO | CANCELADO
    @Column(name = "estado", nullable = false)
    private String estado;

    // ESTANDAR | EXPRESS | RETIRO
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

    @OneToMany(mappedBy = "encargo", cascade = CascadeType.ALL)
    private List<DetalleEncargo> detalles = new ArrayList<>();

    protected Encargo() {
    }

    public Encargo(String numeroOrden, Long usuarioId, String clienteNombre, String clienteCorreo,
                   String tipoEntrega, int costoEntrega, String direccionEnvio, Long idComunaEnvio) {
        this.numeroOrden = numeroOrden;
        this.usuarioId = usuarioId;
        this.clienteNombre = clienteNombre;
        this.clienteCorreo = clienteCorreo;
        this.fecha = LocalDateTime.now();
        this.estado = "PENDIENTE";
        this.tipoEntrega = tipoEntrega;
        this.costoEntrega = costoEntrega;
        this.direccionEnvio = direccionEnvio;
        this.idComunaEnvio = idComunaEnvio;
        this.total = (long) costoEntrega;
    }

    // Agrega una línea al pedido con el precio vigente y suma su subtotal al total.
    public void agregarDetalle(Producto producto, int cantidad) {
        detalles.add(new DetalleEncargo(this, producto, cantidad, producto.getPrecio()));
        total += (long) producto.getPrecio() * cantidad;
    }

    public Long getId() { return id; }
    public String getNumeroOrden() { return numeroOrden; }
    public Long getUsuarioId() { return usuarioId; }
    public String getClienteNombre() { return clienteNombre; }
    public String getClienteCorreo() { return clienteCorreo; }
    public LocalDateTime getFecha() { return fecha; }
    public String getEstado() { return estado; }
    public String getTipoEntrega() { return tipoEntrega; }
    public Integer getCostoEntrega() { return costoEntrega; }
    public String getDireccionEnvio() { return direccionEnvio; }
    public Long getIdComunaEnvio() { return idComunaEnvio; }
    public Long getTotal() { return total; }
    public List<DetalleEncargo> getDetalles() { return detalles; }
}
