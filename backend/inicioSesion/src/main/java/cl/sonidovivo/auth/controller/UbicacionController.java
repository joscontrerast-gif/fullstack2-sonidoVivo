package cl.sonidovivo.auth.controller;

import cl.sonidovivo.auth.dto.UbicacionDto;
import cl.sonidovivo.auth.entity.Comuna;
import cl.sonidovivo.auth.entity.Region;
import cl.sonidovivo.auth.repository.ComunaRepository;
import cl.sonidovivo.auth.repository.RegionRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Datos públicos para los selectores región → comuna del formulario de registro. */
@RestController
@RequestMapping("/api")
public class UbicacionController {

    private final RegionRepository regiones;
    private final ComunaRepository comunas;

    public UbicacionController(RegionRepository regiones, ComunaRepository comunas) {
        this.regiones = regiones;
        this.comunas = comunas;
    }

    @GetMapping("/regiones")
    public List<UbicacionDto> regiones() {
        return regiones.findAll(Sort.by("id")).stream()
                .map((Region r) -> new UbicacionDto(r.getId(), r.getNombre()))
                .toList();
    }

    @GetMapping("/comunas")
    public List<UbicacionDto> comunas(@RequestParam Long idRegion) {
        return comunas.findByIdRegionOrderByNombreAsc(idRegion).stream()
                .map((Comuna c) -> new UbicacionDto(c.getId(), c.getNombre()))
                .toList();
    }
}
