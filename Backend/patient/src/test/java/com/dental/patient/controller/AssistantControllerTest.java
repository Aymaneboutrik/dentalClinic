package com.dental.patient.controller;

import com.dental.patient.domain.Patient;
import com.dental.patient.dto.ConsultationDto;
import com.dental.patient.dto.PatientDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.ConsultationService;
import com.dental.patient.service.DocumentService;
import com.dental.patient.service.PatientService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AssistantController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
class AssistantControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientService patientService;

    @MockBean
    private ConsultationService consultationService;

    @MockBean
    private DocumentService documentService;

    @MockBean
    private PatientMapper patientMapper;

    @Test
    void getPatientById_ShouldReturnPatient() throws Exception {
        Patient patient = new Patient();
        PatientDto dto = new PatientDto();
        dto.setId(2L);

        when(patientService.getPatientById(2L)).thenReturn(patient);
        when(patientMapper.toPatientDto(patient)).thenReturn(dto);

        mockMvc.perform(get("/api/assistant/patients/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2L));
    }
}
