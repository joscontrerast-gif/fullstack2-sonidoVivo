package com.sonidoVivo.ms_carrito.repository;

import com.sonidoVivo.ms_carrito.model.Encargo;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EncargoRepository extends JpaRepository<Encargo, Long> {

    // Encargos de un cliente, del más reciente al más antiguo, con sus líneas y productos ya cargados.
    @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
    List<Encargo> findByUsuarioIdOrderByFechaDescIdDesc(Long usuarioId);
}
