package com.sonidoVivo.ms_carrito.repository;

import com.sonidoVivo.ms_carrito.model.ItemCarrito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {

    List<ItemCarrito> findByUsuarioIdOrderByIdAsc(Long usuarioId);

    Optional<ItemCarrito> findByUsuarioIdAndProducto_Codigo(Long usuarioId, String codigo);

    void deleteByUsuarioId(Long usuarioId);
}
