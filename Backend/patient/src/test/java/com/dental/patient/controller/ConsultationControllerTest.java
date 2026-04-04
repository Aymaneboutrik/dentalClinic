package com.dental.patient.controller;

import com.dental.patient.domain.Consultation;
import com.dental.patient.dto.ConsultationDto;
import com.dental.patient.dto.CreateConsultationRequest;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.ConsultationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ConsultationController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
class ConsultationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConsultationService consultationService;

    @MockBean
    private PatientMapper patientMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getHistory_ShouldReturnList() throws Exception {
        Consultation consultation = new Consultation();
        ConsultationDto dto = new ConsultationDto();
        dto.setId(10L);

        when(consultationService.getPatientHistory(1L)).thenReturn(Collections.singletonList(consultation));
        when(patientMapper.toConsultationDtoList(any())).thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/consultations/patient/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10L));
    }

    @Test
    void addConsultation_ShouldReturnOk() throws Exception {
        CreateConsultationRequest request = new CreateConsultationRequest();
        request.setMotif("Test motif");

        Consultation consultation = new Consultation();
        ConsultationDto dto = new ConsultationDto();
        dto.setId(100L);
        dto.setMotif("Test motif");

        when(consultationService.addConsultation(anyLong(), anyString(), any())).thenReturn(consultation);
        when(patientMapper.toConsultationDto(any())).thenReturn(dto);

        mockMvc.perform(post("/api/consultations/patient/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L));
    }
}
