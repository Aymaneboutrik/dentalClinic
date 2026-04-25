package com.facturation.paiement.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.facturation.paiement.dto.RemiseRequestDTO;
import com.facturation.paiement.dto.RemiseResponseDTO;
import com.facturation.paiement.enums.TypeRemise;
import com.facturation.paiement.services.RemiseService;
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

@WebMvcTest(RemiseController.class)
@DisplayName("Tests d'intégration - RemiseController")
class RemiseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RemiseService remiseService;

    @Test
    void create_shouldReturnCreated() throws Exception {
        RemiseRequestDTO request = RemiseRequestDTO.builder()
                .valeur(10.0)
                .dateRemise(LocalDate.now())
                .typeRemise(TypeRemise.VARIABLE)
                .factureId(1L)
                .build();
        RemiseResponseDTO response = RemiseResponseDTO.builder().id(1L).build();
        when(remiseService.create(any(RemiseRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/remises")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findById_shouldReturnOk() throws Exception {
        RemiseResponseDTO response = RemiseResponseDTO.builder().id(1L).build();
        when(remiseService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/remises/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findAll_shouldReturnList() throws Exception {
        List<RemiseResponseDTO> responses = List.of(RemiseResponseDTO.builder().id(1L).build());
        when(remiseService.findAll()).thenReturn(responses);

        mockMvc.perform(get("/api/remises"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void findByFactureId_shouldReturnList() throws Exception {
        List<RemiseResponseDTO> responses = List.of(RemiseResponseDTO.builder().id(1L).factureId(2L).build());
        when(remiseService.findByFactureId(2L)).thenReturn(responses);

        mockMvc.perform(get("/api/remises/facture/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void update_shouldReturnOk() throws Exception {
        RemiseRequestDTO request = RemiseRequestDTO.builder()
                .valeur(50.0)
                .dateRemise(LocalDate.now())
                .typeRemise(TypeRemise.FIXE)
                .factureId(1L)
                .build();
        RemiseResponseDTO response = RemiseResponseDTO.builder().id(1L).build();
        when(remiseService.update(eq(1L), any(RemiseRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/remises/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(remiseService).delete(1L);

        mockMvc.perform(delete("/api/remises/1"))
                .andExpect(status().isNoContent());

        verify(remiseService).delete(1L);
    }
}
