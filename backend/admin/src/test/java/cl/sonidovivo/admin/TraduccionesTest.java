package cl.sonidovivo.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import cl.sonidovivo.admin.service.Traducciones;
import org.junit.jupiter.api.Test;

class TraduccionesTest {

    @Test
    void conviertePasaDeCodigoATexto() {
        assertEquals("En Proceso", Traducciones.texto("EN_PROCESO"));
        assertEquals("Activo", Traducciones.texto("ACTIVO"));
        assertEquals("Administrador", Traducciones.texto("ADMINISTRADOR"));
        assertNull(Traducciones.texto(null));
    }

    @Test
    void conviertePasaDeTextoACodigo() {
        assertEquals("EN_PROCESO", Traducciones.codigo("En Proceso"));
        assertEquals("EN_PROCESO", Traducciones.codigo("EN_PROCESO"));
        assertEquals("ESTANDAR", Traducciones.codigo("Estándar"));
        assertNull(Traducciones.codigo(null));
    }

    @Test
    void traduceElTipoDeEntrega() {
        assertEquals("Entrega estándar", Traducciones.entrega("ESTANDAR"));
        assertEquals("Entrega express", Traducciones.entrega("EXPRESS"));
        assertEquals("Retiro en tienda", Traducciones.entrega("RETIRO"));
    }
}
