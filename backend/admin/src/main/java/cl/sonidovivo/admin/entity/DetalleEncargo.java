package cl.sonidovivo.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "detalle_encargo")
public class DetalleEncargo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_encargo")
    private Encargo encargo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false)
    private Integer precioUnitario;

    // Columna virtual de Oracle (cantidad * precio_unitario): solo lectura.
    @Column(name = "subtotal", insertable = false, updatable = false)
    private Long subtotal;

    public Long getId() { return id; }
    public Encargo getEncargo() { return encargo; }
    public Producto getProducto() { return producto; }
    public Integer getCantidad() { return cantidad; }
    public Integer getPrecioUnitario() { return precioUnitario; }
    public Long getSubtotal() { return subtotal; }
}
