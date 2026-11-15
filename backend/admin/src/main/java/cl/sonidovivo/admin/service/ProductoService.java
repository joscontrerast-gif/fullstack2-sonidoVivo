package cl.sonidovivo.admin.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.sonidovivo.admin.dto.ProductoDto;
import cl.sonidovivo.admin.dto.ProductoRequest;
import cl.sonidovivo.admin.entity.Categoria;
import cl.sonidovivo.admin.entity.Producto;
import cl.sonidovivo.admin.repository.CategoriaRepository;
import cl.sonidovivo.admin.repository.DetalleEncargoRepository;
import cl.sonidovivo.admin.repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository productos;
    private final CategoriaRepository categorias;
    private final DetalleEncargoRepository detalles;

    public ProductoService(ProductoRepository productos, CategoriaRepository categorias,
                           DetalleEncargoRepository detalles) {
        this.productos = productos;
        this.categorias = categorias;
        this.detalles = detalles;
    }

    @Transactional(readOnly = true)
    public List<ProductoDto> listar(boolean incluirInactivos, String q, String categoria) {
        String busca = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return productos.findAll(Sort.by("codigo")).stream()
                .filter(p -> incluirInactivos || Integer.valueOf(1).equals(p.getActivo()))
                .filter(p -> categoria == null || categoria.isBlank()
                        || p.getCategoria().getNombre().equalsIgnoreCase(categoria.trim()))
                .filter(p -> busca.isEmpty() || contiene(p.getCodigo(), busca)
                        || contiene(p.getNombre(), busca) || contiene(p.getMarca(), busca))
                .map(ProductoDto::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductoDto obtener(String codigo) {
        return ProductoDto.de(buscar(codigo));
    }

    @Transactional(readOnly = true)
    public List<String> nombresCategorias() {
        return categorias.findAll(Sort.by("nombre")).stream().map(Categoria::getNombre).toList();
    }

    @Transactional
    public ProductoDto crear(ProductoRequest r) {
        String codigo = normalizarCodigo(r.codigo());
        if (productos.existsByCodigo(codigo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un producto con el código " + codigo);
        }
        Producto p = new Producto();
        p.setCodigo(codigo);
        aplicar(p, r);
        p.setFechaIngreso(LocalDate.now());
        p.setActivo(1);
        return ProductoDto.de(productos.save(p));
    }

    @Transactional
    public ProductoDto actualizar(String codigo, ProductoRequest r) {
        Producto p = buscar(codigo);
        aplicar(p, r);
        if (r.activo() != null) {
            p.setActivo(r.activo() ? 1 : 0);
        }
        return ProductoDto.de(p);
    }

    /**
     * Si el producto ya tiene ventas se desactiva (baja lógica) para conservar el historial;
     * si nunca se vendió se elimina. Devuelve true si se eliminó de verdad.
     */
    @Transactional
    public boolean eliminar(String codigo) {
        Producto p = buscar(codigo);
        if (detalles.existsByProducto_Id(p.getId())) {
            p.setActivo(0);
            return false;
        }
        productos.delete(p);
        return true;
    }

    private Producto buscar(String codigo) {
        return productos.findByCodigo(normalizarCodigo(codigo))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    private void aplicar(Producto p, ProductoRequest r) {
        p.setNombre(r.nombre().trim());
        p.setMarca(vacioANulo(r.marca()));
        p.setModelo(vacioANulo(r.modelo()));
        p.setDescripcion(vacioANulo(r.descripcion()));
        p.setImagen(vacioANulo(r.imagen()));
        p.setPrecio(r.precio());
        p.setStock(r.stock());
        p.setStockCritico(r.stockCritico());
        p.setCategoria(resolverCategoria(r.categoria()));
    }

    /** Usa la categoría si existe (sin distinguir mayúsculas) y la crea si es nueva. */
    private Categoria resolverCategoria(String nombre) {
        String limpio = nombre.trim();
        return categorias.findByNombreIgnoreCase(limpio).orElseGet(() -> {
            Categoria c = new Categoria();
            c.setNombre(limpio);
            return categorias.save(c);
        });
    }

    static String normalizarCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código es obligatorio");
        }
        String limpio = codigo.trim().toUpperCase(Locale.ROOT);
        if (!limpio.matches("^[A-Z0-9-]{3,20}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El código debe tener de 3 a 20 letras, números o guiones");
        }
        return limpio;
    }

    private static String vacioANulo(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private static boolean contiene(String texto, String busca) {
        return texto != null && texto.toLowerCase(Locale.ROOT).contains(busca);
    }
}