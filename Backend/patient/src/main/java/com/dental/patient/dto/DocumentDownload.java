package com.dental.patient.dto;

public record DocumentDownload(String fileName, String contentType, byte[] content) {
}
