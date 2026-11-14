package cl.sonidovivo.admin.repository;

import cl.sonidovivo.admin.entity.Producto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    long countByActivo(Integer activo);

    @Query("select p from Producto p where p.activo = 1 and p.stockCritico is not null "
            + "and p.stock <= p.stockCritico order by p.stock")
    List<Producto> findConStockCritico();
}
