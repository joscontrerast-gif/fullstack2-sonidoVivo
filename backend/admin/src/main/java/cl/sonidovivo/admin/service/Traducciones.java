package cl.sonidovivo.admin.service;

import java.text.Normalizer;
import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

/** Convierte entre los códigos de la base de datos (EN_PROCESO) y el texto del frontend (En Proceso). */
public final class Traducciones {

    private Traducciones() {
    }

    /** EN_PROCESO → "En Proceso", ACTIVO → "Activo", CLIENTE → "Cliente". */
    public static String texto(String codigo) {
        if (codigo == null) {
            return null;
        }
        return Arrays.stream(codigo.split("_"))
                .map(p -> p.isEmpty() ? p : p.substring(0, 1).toUpperCase(Locale.ROOT) + p.substring(1).toLowerCase(Locale.ROOT))
                .collect(Collectors.joining(" "));
    }

    /** "En Proceso" → EN_PROCESO (sin tildes, en mayúscula, espacios a guion bajo). */
    public static String codigo(String texto) {
        if (texto == null) {
            return null;
        }
        String sinTildes = Normalizer.normalize(texto.trim(), Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return sinTildes.toUpperCase(Locale.ROOT).replaceAll("\\s+", "_");
    }

    public static String entrega(String codigo) {
        if (codigo == null) {
            return null;
        }
        return switch (codigo) {
            case "ESTANDAR" -> "Entrega estándar";
            case "EXPRESS" -> "Entrega express";
            case "RETIRO" -> "Retiro en tienda";
            default -> texto(codigo);
        };
    }
}
