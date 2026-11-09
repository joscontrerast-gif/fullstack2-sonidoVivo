package cl.sonidovivo.admin.repository;

import cl.sonidovivo.admin.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Long> {
}
