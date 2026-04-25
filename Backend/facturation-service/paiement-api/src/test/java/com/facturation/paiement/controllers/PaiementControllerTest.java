package com.facturation.paiement.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.facturation.paiement.dto.PaiementRequestDTO;
import com.facturation.paiement.dto.PaiementResponseDTO;
import com.facturation.paiement.enums.ModePaiement;
import com.facturation.paiement.services.PaiementService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaiementController.class)
@DisplayName("Tests d'intégration - PaiementController")
class PaiementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaiementService paiementService;

    @Test
    void create_shouldReturnCreated() throws Exception {
        PaiementRequestDTO request = PaiementRequestDTO.builder()
                .datePaiement(LocalDate.now())
                .montant(150.0)
                .modePaiement(ModePaiement.CARTE_BANCAIRE)
                .factureId(1L)
                .build();
        PaiementResponseDTO response = PaiementResponseDTO.builder().id(1L).build();
        when(paiementService.create(any(PaiementRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/paiements")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findById_shouldReturnOk() throws Exception {
        PaiementResponseDTO response = PaiementResponseDTO.builder().id(1L).build();
        when(paiementService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/paiements/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findAll_shouldReturnList() throws Exception {
        List<PaiementResponseDTO> responses = List.of(PaiementResponseDTO.builder().id(1L).build());
        when(paiementService.findAll()).thenReturn(responses);

        mockMvc.perform(get("/api/paiements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void findByFactureId_shouldReturnList() throws Exception {
        List<PaiementResponseDTO> responses = List.of(PaiementResponseDTO.builder().id(1L).factureId(10L).build());
        when(paiementService.findByFactureId(10L)).thenReturn(responses);

        mockMvc.perform(get("/api/paiements/facture/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void update_shouldReturnOk() throws Exception {
        PaiementRequestDTO request = PaiementRequestDTO.builder()
                .datePaiement(LocalDate.now())
                .montant(180.0)
                .modePaiement(ModePaiement.ESPECES)
                .factureId(1L)
                .build();
        PaiementResponseDTO response = PaiementResponseDTO.builder().id(1L).build();
        when(paiementService.update(eq(1L), any(PaiementRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/paiements/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(paiementService).delete(1L);

        mockMvc.perform(delete("/api/paiements/1"))
                .andExpect(status().isNoContent());

        verify(paiementService).delete(1L);
    }
}
