package com.dental.patient.controller;

import com.dental.patient.domain.Ordonnance;
import com.dental.patient.dto.OrdonnanceDto;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.OrdonnanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OrdonnanceController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
class OrdonnanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrdonnanceService ordonnanceService;

    @MockBean
    private PatientMapper patientMapper;

    @Test
    void getById_ShouldReturnOrdonnance() throws Exception {
        Ordonnance ordonnance = new Ordonnance();
        OrdonnanceDto dto = new OrdonnanceDto();

        when(ordonnanceService.getOrdonnanceById(1L)).thenReturn(ordonnance);
        when(patientMapper.toOrdonnanceDto(ordonnance)).thenReturn(dto);

        mockMvc.perform(get("/api/ordonnances/1"))
                .andExpect(status().isOk());
    }

    @Test
    void delete_ShouldReturnOk() throws Exception {
        doNothing().when(ordonnanceService).deleteOrdonnance(1L);

        mockMvc.perform(delete("/api/ordonnances/1"))
                .andExpect(status().isOk());
    }
}
