package com.javaguides.auth_service.controller;

import com.javaguides.auth_service.config.JwtUtils;
import com.javaguides.auth_service.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StatsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private StatsController statsController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(statsController).build();
    }

    @Test
    void getStats_Success() throws Exception {
        when(utilisateurRepository.countByActifTrue()).thenReturn(5L);

        mockMvc.perform(get("/api/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeUsers").value(5));
    }
}
