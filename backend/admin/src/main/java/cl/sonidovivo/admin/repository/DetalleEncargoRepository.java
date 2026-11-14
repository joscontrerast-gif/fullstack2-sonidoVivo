package cl.sonidovivo.admin.repository;

import cl.sonidovivo.admin.entity.DetalleEncargo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleEncargoRepository extends JpaRepository<DetalleEncargo, Long> {
    boolean existsByProducto_Id(Long idProducto);
}
