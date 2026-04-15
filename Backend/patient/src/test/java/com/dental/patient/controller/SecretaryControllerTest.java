package com.dental.patient.controller;

import com.dental.patient.domain.Patient;
import com.dental.patient.dto.SecretaryPatientDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.repository.PatientRepository;
import com.dental.patient.service.ConsultationService;
import com.dental.patient.service.DocumentService;
import com.dental.patient.service.PatientService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SecretaryController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
class SecretaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientService patientService;

    @MockBean
    private ConsultationService consultationService;

    @MockBean
    private DocumentService documentService;

    @MockBean
    private PatientRepository patientRepository;

    @MockBean
    private PatientMapper patientMapper;

    @Test
    void getPatientByCin_ShouldReturnPatient() throws Exception {
        Patient patient = new Patient();
        SecretaryPatientDto dto = new SecretaryPatientDto();
        dto.setCin("CINTEST");

        when(patientRepository.findByCin("CINTEST")).thenReturn(Optional.of(patient));
        when(patientMapper.toSecretaryDto(patient)).thenReturn(dto);

        mockMvc.perform(get("/api/sec/patients/by-cin").param("cin", "CINTEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cin").value("CINTEST"));
    }

    @Test
    void getPatientByCin_ShouldReturnNotFound_WhenNotExists() throws Exception {
        when(patientRepository.findByCin("WRONGCIN")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/sec/patients/by-cin").param("cin", "WRONGCIN"))
                .andExpect(status().isNotFound());
    }
}
