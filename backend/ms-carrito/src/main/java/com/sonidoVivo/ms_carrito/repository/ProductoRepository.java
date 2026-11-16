package com.sonidoVivo.ms_carrito.repository;

import com.sonidoVivo.ms_carrito.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);

    // Descuenta stock de forma atómica: solo si alcanza. Devuelve 1 si lo hizo y 0 si no había stock
    // suficiente (evita la sobreventa cuando dos clientes compran a la vez).
    @Modifying(flushAutomatically = true)
    @Query("update Producto p set p.stock = p.stock - :cantidad "
            + "where p.id = :id and p.activo = 1 and p.stock >= :cantidad")
    int descontarStock(@Param("id") Long id, @Param("cantidad") int cantidad);
}
