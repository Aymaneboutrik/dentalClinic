package com.facturation.paiement.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.facturation.paiement.dto.ActeMedicalRequestDTO;
import com.facturation.paiement.dto.ActeMedicalResponseDTO;
import com.facturation.paiement.enums.TypeActe;
import com.facturation.paiement.services.ActeMedicalService;
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

@WebMvcTest(ActeMedicalController.class)
@DisplayName("Tests d'intégration - ActeMedicalController")
class ActeMedicalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ActeMedicalService acteMedicalService;

    @Test
    void create_shouldReturnCreatedResponse() throws Exception {
        ActeMedicalRequestDTO request = ActeMedicalRequestDTO.builder()
                .libelle("Consultation")
                .prix(150.0)
                .typeActe(TypeActe.CONSULTATION)
                .build();
        ActeMedicalResponseDTO response = ActeMedicalResponseDTO.builder().id(1L).build();
        when(acteMedicalService.create(any(ActeMedicalRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/actes-medicaux")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findById_shouldReturnOkResponse() throws Exception {
        ActeMedicalResponseDTO response = ActeMedicalResponseDTO.builder().id(1L).libelle("Soin").build();
        when(acteMedicalService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/actes-medicaux/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.libelle").value("Soin"));
    }

    @Test
    void findAll_shouldReturnList() throws Exception {
        List<ActeMedicalResponseDTO> responses = List.of(ActeMedicalResponseDTO.builder().id(1L).build());
        when(acteMedicalService.findAll()).thenReturn(responses);

        mockMvc.perform(get("/api/actes-medicaux"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(acteMedicalService).delete(1L);

        mockMvc.perform(delete("/api/actes-medicaux/1"))
                .andExpect(status().isNoContent());

        verify(acteMedicalService).delete(1L);
    }
}
