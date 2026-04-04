package com.dental.patient.controller;

import com.dental.patient.domain.Patient;
import com.dental.patient.dto.PatientDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.PatientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PatientController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientService patientService;

    @MockBean
    private PatientMapper patientMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAllPatients_ShouldReturnList() throws Exception {
        Patient patient = new Patient();
        PatientDto dto = new PatientDto();
        dto.setId(1L);

        when(patientService.getAllPatients()).thenReturn(Collections.singletonList(patient));
        when(patientMapper.toPatientDtoList(any())).thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));
    }

    @Test
    void getPatientById_ShouldReturnPatient() throws Exception {
        Patient patient = new Patient();
        PatientDto dto = new PatientDto();
        dto.setId(1L);

        when(patientService.getPatientById(1L)).thenReturn(patient);
        when(patientMapper.toPatientDto(patient)).thenReturn(dto);

        mockMvc.perform(get("/api/patients/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }
}
