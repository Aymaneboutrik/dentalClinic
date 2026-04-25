package com.facturation.paiement.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.facturation.paiement.dto.TransactionRequestDTO;
import com.facturation.paiement.dto.TransactionResponseDTO;
import com.facturation.paiement.services.TransactionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
@DisplayName("Tests d'intégration - TransactionController")
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionService transactionService;

    @Test
    void create_shouldReturnCreated() throws Exception {
        TransactionRequestDTO request = TransactionRequestDTO.builder()
                .date(LocalDateTime.now())
                .montantAvant(700.0)
                .montantApres(600.0)
                .montantRemise(100.0)
                .remiseId(1L)
                .build();
        TransactionResponseDTO response = TransactionResponseDTO.builder().id(1L).build();
        when(transactionService.save(any(TransactionRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findById_shouldReturnOk() throws Exception {
        TransactionResponseDTO response = TransactionResponseDTO.builder().id(1L).build();
        when(transactionService.findById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/transactions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void findAll_shouldReturnList() throws Exception {
        List<TransactionResponseDTO> responses = List.of(TransactionResponseDTO.builder().id(1L).build());
        when(transactionService.findAll()).thenReturn(responses);

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void findByRemiseId_shouldReturnList() throws Exception {
        List<TransactionResponseDTO> responses = List.of(TransactionResponseDTO.builder().id(1L).remiseId(4L).build());
        when(transactionService.findByRemiseId(4L)).thenReturn(responses);

        mockMvc.perform(get("/api/transactions/remise/4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void update_shouldReturnOk() throws Exception {
        TransactionRequestDTO request = TransactionRequestDTO.builder()
                .date(LocalDateTime.now())
                .montantAvant(900.0)
                .montantApres(810.0)
                .montantRemise(90.0)
                .remiseId(2L)
                .build();
        TransactionResponseDTO response = TransactionResponseDTO.builder().id(1L).build();
        when(transactionService.update(eq(1L), any(TransactionRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/transactions/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void delete_shouldReturnNoContent() throws Exception {
        doNothing().when(transactionService).deleteById(1L);

        mockMvc.perform(delete("/api/transactions/1"))
                .andExpect(status().isNoContent());

        verify(transactionService).deleteById(1L);
    }
}
