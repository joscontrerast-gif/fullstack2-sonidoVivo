package cl.sonidovivo.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(name = "run")
    private String run;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "apellidos")
    private String apellidos;

    @Column(name = "correo", nullable = false)
    private String correo;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_rol")
    private Rol rol;

    @Column(name = "id_comuna")
    private Long idComuna;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "estado", nullable = false)
    private String estado = "ACTIVO";

    @Column(name = "fecha_registro", insertable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    public Long getId() { return id; }
    public String getRun() { return run; }
    public void setRun(String run) { this.run = run; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }
    public Long getIdComuna() { return idComuna; }
    public void setIdComuna(Long idComuna) { this.idComuna = idComuna; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
}
