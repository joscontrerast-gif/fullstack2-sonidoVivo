package com.sonidoVivo.ms_carrito.service;

import com.sonidoVivo.ms_carrito.dto.CompraRequest;
import com.sonidoVivo.ms_carrito.dto.CompraResponse;
import com.sonidoVivo.ms_carrito.model.Encargo;
import com.sonidoVivo.ms_carrito.model.ItemCarrito;
import com.sonidoVivo.ms_carrito.model.Producto;
import com.sonidoVivo.ms_carrito.repository.EncargoRepository;
import com.sonidoVivo.ms_carrito.repository.ItemCarritoRepository;
import com.sonidoVivo.ms_carrito.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompraServiceTest {

    private static final Long USUARIO = 7L;

    @Mock ItemCarritoRepository items;
    @Mock ProductoRepository productos;
    @Mock EncargoRepository encargos;
    @Mock ConsultasCompra consultas;

    CompraService servicio;

    @BeforeEach
    void preparar() {
        servicio = new CompraService(items, productos, encargos, consultas);
    }

    private static Producto producto(long id, String codigo, String nombre, int precio, int stock, int activo) {
        Producto p = BeanUtils.instantiateClass(Producto.class);

        ReflectionTestUtils.setField(p, "id", id);
        ReflectionTestUtils.setField(p, "codigo", codigo);
        ReflectionTestUtils.setField(p, "nombre", nombre);
        ReflectionTestUtils.setField(p, "precio", precio);
        ReflectionTestUtils.setField(p, "stock", stock);
        ReflectionTestUtils.setField(p, "activo", activo);
        return p;
    }

    private static CompraRequest datos(String entrega) {
        CompraRequest r = new CompraRequest();

        r.setDireccion("  Av. España 123  ");
        r.setComuna("Viña del Mar");
        r.setEntrega(entrega);
        return r;
    }

    private void prepararCompra(List<ItemCarrito> carrito) {
        when(items.findByUsuarioIdOrderByIdAsc(USUARIO)).thenReturn(carrito);
        when(consultas.buscarComuna("Viña del Mar")).thenReturn(5L);
        when(consultas.buscarCliente(USUARIO))
                .thenReturn(new ConsultasCompra.Cliente("María Pérez", "maria@duoc.cl"));
        when(consultas.siguienteNumeroOrden()).thenReturn("ORD-010");
    }

    @Test
    void registraElEncargoDescuentaStockYVaciaElCarrito() {
        Producto guitarra = producto(1, "GE001", "Guitarra", 249990, 5, 1);
        Producto cuerdas = producto(2, "AC001", "Cuerdas", 8990, 25, 1);

        prepararCompra(List.of(new ItemCarrito(USUARIO, guitarra, 2), new ItemCarrito(USUARIO, cuerdas, 3)));
        when(productos.descontarStock(anyLong(), anyInt())).thenReturn(1);
        when(encargos.save(any(Encargo.class))).thenAnswer(inv -> inv.getArgument(0));

        CompraResponse r = servicio.confirmar(USUARIO, datos("express"));

        assertEquals("ORD-010", r.numeroOrden());
        assertEquals("PENDIENTE", r.estado());
        assertEquals("EXPRESS", r.tipoEntrega());
        assertEquals(4990, r.costoEntrega());
        assertEquals(2L * 249990 + 3L * 8990 + 4990, r.total());
        assertEquals(2, r.productos().size());
        assertEquals(3L * 8990, r.productos().get(1).subtotal());
        verify(productos).descontarStock(1L, 2);
        verify(productos).descontarStock(2L, 3);
        verify(items).deleteByUsuarioId(USUARIO);
    }

    @Test
    void guardaLosDatosDelClienteYDeLaEntrega() {
        Producto cuerdas = producto(2, "AC001", "Cuerdas", 8990, 25, 1);

        prepararCompra(List.of(new ItemCarrito(USUARIO, cuerdas, 1)));
        when(productos.descontarStock(anyLong(), anyInt())).thenReturn(1);
        when(encargos.save(any(Encargo.class))).thenAnswer(inv -> inv.getArgument(0));

        servicio.confirmar(USUARIO, datos(null));

        org.mockito.ArgumentCaptor<Encargo> captor = org.mockito.ArgumentCaptor.forClass(Encargo.class);

        verify(encargos).save(captor.capture());
        Encargo e = captor.getValue();

        assertEquals(USUARIO, e.getUsuarioId());
        assertEquals("María Pérez", e.getClienteNombre());
        assertEquals("maria@duoc.cl", e.getClienteCorreo());
        assertEquals("ESTANDAR", e.getTipoEntrega());
        assertEquals("Av. España 123", e.getDireccionEnvio());
        assertEquals(5L, e.getIdComunaEnvio());
        assertEquals(8990L + 1990L, e.getTotal());
    }

    @Test
    void rechazaUnCarritoVacio() {
        when(items.findByUsuarioIdOrderByIdAsc(USUARIO)).thenReturn(List.of());

        ResponseStatusException e =
                assertThrows(ResponseStatusException.class, () -> servicio.confirmar(USUARIO, datos("estandar")));

        assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
        verify(encargos, never()).save(any());
    }

    @Test
    void noCompraSiNoHayStockSuficiente() {
        Producto guitarra = producto(1, "GE001", "Guitarra", 249990, 1, 1);

        prepararCompra(List.of(new ItemCarrito(USUARIO, guitarra, 2)));
        when(productos.descontarStock(1L, 2)).thenReturn(0);

        ResponseStatusException e =
                assertThrows(ResponseStatusException.class, () -> servicio.confirmar(USUARIO, datos("estandar")));

        assertEquals(HttpStatus.CONFLICT, e.getStatusCode());
        verify(encargos, never()).save(any());
        verify(items, never()).deleteByUsuarioId(anyLong());
    }

    @Test
    void noCompraUnProductoDesactivado() {
        Producto viejo = producto(3, "OLD01", "Descontinuado", 1000, 5, 0);

        prepararCompra(List.of(new ItemCarrito(USUARIO, viejo, 1)));

        ResponseStatusException e =
                assertThrows(ResponseStatusException.class, () -> servicio.confirmar(USUARIO, datos("estandar")));

        assertEquals(HttpStatus.CONFLICT, e.getStatusCode());
        verify(productos, never()).descontarStock(anyLong(), anyInt());
        verify(encargos, never()).save(any());
    }

    @Test
    void calculaElCostoDeEntregaEnElServidor() {
        assertEquals("ESTANDAR", CompraService.tipoEntrega(null));
        assertEquals("ESTANDAR", CompraService.tipoEntrega("  "));
        assertEquals("EXPRESS", CompraService.tipoEntrega("express"));
        assertEquals(0, CompraService.COSTOS_ENTREGA.get(CompraService.tipoEntrega("Retiro")));
        assertEquals(1990, CompraService.COSTOS_ENTREGA.get("ESTANDAR"));
    }

    @Test
    void rechazaUnTipoDeEntregaDesconocido() {
        ResponseStatusException e =
                assertThrows(ResponseStatusException.class, () -> CompraService.tipoEntrega("dron"));

        assertEquals(HttpStatus.BAD_REQUEST, e.getStatusCode());
    }
}
