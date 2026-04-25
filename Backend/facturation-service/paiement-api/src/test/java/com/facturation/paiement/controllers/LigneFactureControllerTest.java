package com.facturation.paiement.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.facturation.paiement.dto.LigneFactureRequestDTO;
import com.facturation.paiement.dto.LigneFactureResponseDTO;
import com.facturation.paiement.services.LigneFactureService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LigneFactureController.class)
@DisplayName("Tests d'intégration - LigneFactureController")
class LigneFactureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LigneFactureService ligneFactureService;

    @Test
    @DisplayName("POST /api/lignes-facture - Create")
    void create_shouldReturnCreated() throws Exception {
        LigneFactureRequestDTO request = LigneFactureRequestDTO.builder().factureId(1L).acteMedicalId(2L).quantite(3).build();
        LigneFactureResponseDTO response = LigneFactureResponseDTO.builder().id(1L).build();
        when(ligneFactureService.create(any(LigneFactureRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/lignes-facture")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    @DisplayName("GET /api/lignes-facture/facture/{id} - FindByFactureId")
    void findByFactureId_shouldReturnList() throws Exception {
        List<LigneFactureResponseDTO> list = List.of(LigneFactureResponseDTO.builder().id(1L).build());
        when(ligneFactureService.findByFactureId(1L)).thenReturn(list);

        mockMvc.perform(get("/api/lignes-facture/facture/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    @DisplayName("DELETE /api/lignes-facture/{id} - Delete")
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(ligneFactureService).delete(1L);

        mockMvc.perform(delete("/api/lignes-facture/1"))
                .andExpect(status().isNoContent());

        verify(ligneFactureService).delete(1L);
    }
}
