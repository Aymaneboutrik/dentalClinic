package com.javaguides.auth_service.controller;

import com.javaguides.auth_service.models.Dentiste;
import com.javaguides.auth_service.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private UserController userController;

    private Dentiste mockDentist;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(userController, "authService", authService);
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();

        mockDentist = new Dentiste();
        mockDentist.setIdUtilisateur(1);
        mockDentist.setEmail("admin@example.com");
        mockDentist.setNom("Admin");
        mockDentist.setPrenom("Dentist");

        // Mock authentication context
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                mockDentist, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void getAllUsers_Success() throws Exception {
        when(authService.getAllUsers()).thenReturn(Collections.singletonList(mockDentist));

        mockMvc.perform(get("/api/users"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@example.com"));
    }

    @Test
    void getProfile_Success() throws Exception {
        mockMvc.perform(get("/api/users/profile"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@example.com"));
    }

    @Test
    void changePassword_Success() throws Exception {
        String jsonRequest = "{\"oldPassword\":\"old\",\"newPassword\":\"new-password\"}";

        mockMvc.perform(post("/api/users/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andDo(print())
                .andExpect(status().isOk());

        verify(authService, times(1)).changePassword(eq(1), eq("old"), eq("new-password"));
    }

    @Test
    void updateUserStatus_Success() throws Exception {
        String jsonRequest = "{\"active\":false}";

        mockMvc.perform(post("/api/users/2/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andDo(print())
                .andExpect(status().isOk());

        verify(authService, times(1)).updateUserStatus(2, false);
    }

    @Test
    void updateUser_Success() throws Exception {
        String jsonRequest = "{\"nom\":\"Updated\"}";

        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonRequest))
                .andDo(print())
                .andExpect(status().isOk());

        verify(authService, times(1)).updateUser(eq(1), any());
    }
}
