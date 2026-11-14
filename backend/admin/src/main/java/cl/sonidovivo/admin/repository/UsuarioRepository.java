package cl.sonidovivo.admin.repository;

import cl.sonidovivo.admin.entity.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    Optional<Usuario> findByRun(String run);

    List<Usuario> findByRol_NombreOrderByNombreAsc(String nombre);

    List<Usuario> findByRol_NombreNotOrderByNombreAsc(String nombre);

    long countByRol_Nombre(String nombre);

    long countByRol_NombreNot(String nombre);
}
