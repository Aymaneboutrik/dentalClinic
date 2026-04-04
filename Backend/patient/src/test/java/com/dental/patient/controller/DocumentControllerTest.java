package com.dental.patient.controller;

import com.dental.patient.dto.DocumentDownload;
import com.dental.patient.mapper.PatientMapper;
import com.dental.patient.service.DocumentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = DocumentController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DocumentService documentService;

    @MockBean
    private PatientMapper patientMapper;

    @Test
    void downloadDocument_ShouldReturnFileContent() throws Exception {
        byte[] content = "test content".getBytes();
        DocumentDownload download = new DocumentDownload("test.pdf", MediaType.APPLICATION_PDF_VALUE, content);

        when(documentService.loadDocumentForDownload(1L)).thenReturn(download);

        mockMvc.perform(get("/api/documents/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"test.pdf\""))
                .andExpect(content().bytes(content));
    }
}
