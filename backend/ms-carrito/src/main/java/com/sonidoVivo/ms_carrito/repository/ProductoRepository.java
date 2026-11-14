package com.sonidoVivo.ms_carrito.repository;

import com.sonidoVivo.ms_carrito.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);
}
