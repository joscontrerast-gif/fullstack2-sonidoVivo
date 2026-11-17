package cl.sonidovivo.admin.config;

import cl.sonidovivo.admin.entity.Producto;
import cl.sonidovivo.admin.repository.ProductoRepository;
import java.sql.Connection;
import java.sql.Statement;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class MigracionImagenesConfig {

    @Bean
    static BeanPostProcessor asegurarColumnaImagen() {
        return new BeanPostProcessor() {
            @Override
            public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
                if (bean instanceof DataSource ds) {
                    try (Connection con = ds.getConnection();
                         Statement st = con.createStatement()) {
                        st.execute("ALTER TABLE productos ADD (imagen VARCHAR2(500))");
                    } catch (Exception ignored) {
                        // Si la columna ya existe en Oracle/H2, se omite sin error
                    }
                }
                return bean;
            }
        };
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void poblarImagenesFaltantes(ApplicationReadyEvent event) {
        ProductoRepository repo = event.getApplicationContext().getBean(ProductoRepository.class);
        List<Producto> todos = repo.findAll();
        boolean huboCambios = false;

        for (Producto p : todos) {
            String imagen = p.getImagen();
            if (imagen == null || imagen.isBlank() || imagen.endsWith(".svg")) {
                p.setImagen("/img/productos/" + p.getCodigo() + ".jpg");
                huboCambios = true;
            }
        }

        if (huboCambios) {
            repo.saveAll(todos);
        }
    }
}