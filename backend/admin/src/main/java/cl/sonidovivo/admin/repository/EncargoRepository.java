package cl.sonidovivo.admin.repository;

import cl.sonidovivo.admin.entity.Encargo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EncargoRepository extends JpaRepository<Encargo, Long> {

    @Query("select distinct e from Encargo e left join fetch e.detalles d left join fetch d.producto "
            + "order by e.fecha desc")
    List<Encargo> listarConDetalles();

    @Query("select e from Encargo e left join fetch e.detalles d left join fetch d.producto where e.id = :id")
    Optional<Encargo> buscarConDetalles(@Param("id") Long id);

    @Query("select e.estado, count(e) from Encargo e group by e.estado")
    List<Object[]> contarPorEstado();

    @Query("select coalesce(sum(e.total), 0L) from Encargo e where e.estado = 'COMPLETADO'")
    Long totalVendido();
}
