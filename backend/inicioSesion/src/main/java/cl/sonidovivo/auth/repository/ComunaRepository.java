package cl.sonidovivo.auth.repository;

import cl.sonidovivo.auth.entity.Comuna;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComunaRepository extends JpaRepository<Comuna, Long> {
    List<Comuna> findByIdRegionOrderByNombreAsc(Long idRegion);
}
