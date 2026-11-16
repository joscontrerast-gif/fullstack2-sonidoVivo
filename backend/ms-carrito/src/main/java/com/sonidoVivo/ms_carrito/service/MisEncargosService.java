package com.sonidoVivo.ms_carrito.service;

import com.sonidoVivo.ms_carrito.dto.MiEncargoResponse;
import com.sonidoVivo.ms_carrito.repository.EncargoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Consulta de los encargos que ha hecho un cliente. Solo devuelve los del usuario del token.
@Service
public class MisEncargosService {

    private final EncargoRepository encargoRepositorio;
    private final ConsultasCompra consultas;

    public MisEncargosService(EncargoRepository encargoRepositorio, ConsultasCompra consultas) {
        this.encargoRepositorio = encargoRepositorio;
        this.consultas = consultas;
    }

    @Transactional(readOnly = true)
    public List<MiEncargoResponse> listar(Long usuarioId) {
        return encargoRepositorio.findByUsuarioIdOrderByFechaDescIdDesc(usuarioId).stream()
                .map(e -> MiEncargoResponse.de(e, consultas.nombreComuna(e.getIdComunaEnvio())))
                .toList();
    }
}
