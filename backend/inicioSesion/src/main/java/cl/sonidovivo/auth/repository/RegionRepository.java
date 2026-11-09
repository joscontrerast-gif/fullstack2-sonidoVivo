package cl.sonidovivo.auth.repository;

import cl.sonidovivo.auth.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Long> {
}
