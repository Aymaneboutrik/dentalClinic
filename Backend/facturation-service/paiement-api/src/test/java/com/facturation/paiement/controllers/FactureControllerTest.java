package com.facturation.paiement.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.facturation.paiement.dto.FactureRequestDTO;
import com.facturation.paiement.dto.FactureResponseDTO;
import com.facturation.paiement.services.FactureService;
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

@WebMvcTest(FactureController.class)
@DisplayName("Tests d'intégration - FactureController")
class FactureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FactureService factureService;

    @Test
    void create_shouldReturnCreatedResponse() throws Exception {
        FactureRequestDTO request = FactureRequestDTO.builder()
                .date(LocalDate.now())
                .build();
        FactureResponseDTO response = FactureResponseDTO.builder().id(1L).build();
        when(factureService.create(any(FactureRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/factures")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findById_shouldReturnOkResponse() throws Exception {
        FactureResponseDTO response = FactureResponseDTO.builder().id(1L).build();
        when(factureService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/factures/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findAll_shouldReturnList() throws Exception {
        List<FactureResponseDTO> responses = List.of(FactureResponseDTO.builder().id(1L).build());
        when(factureService.findAll()).thenReturn(responses);

        mockMvc.perform(get("/api/factures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void update_shouldReturnUpdatedResponse() throws Exception {
        FactureRequestDTO request = FactureRequestDTO.builder()
                .date(LocalDate.now())
                .build();
        FactureResponseDTO response = FactureResponseDTO.builder().id(1L).build();
        when(factureService.update(eq(1L), any(FactureRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/factures/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(factureService).delete(1L);

        mockMvc.perform(delete("/api/factures/1"))
                .andExpect(status().isNoContent());

        verify(factureService).delete(1L);
    }
}
