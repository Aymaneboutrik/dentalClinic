package com.dental.patient.mapper;

import com.dental.patient.domain.*;
import com.dental.patient.dto.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PatientMapper {


    // --- Patient Mappings ---
    PatientDto toPatientDto(Patient patient);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dossierMedical", ignore = true)
    Patient toPatientEntity(PatientDto patientDto);

    List<PatientDto> toPatientDtoList(List<Patient> patients);

    // --- DossierMedical Mappings ---
    DossierMedicalDto toDossierDto(DossierMedical dossier);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    DossierMedical toDossierEntity(DossierMedicalDto dossierDto);

    // --- Consultation Mappings ---
    ConsultationDto toConsultationDto(Consultation consultation);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dossier", ignore = true)
    @Mapping(target = "ordonnance", ignore = true)
    @Mapping(target = "actes", ignore = true)
    @Mapping(target = "dentistId", ignore = true)
    Consultation toConsultationEntity(ConsultationDto consultationDto);

    List<ConsultationDto> toConsultationDtoList(List<Consultation> consultations);

    // --- Observation Mappings ---
    @Mapping(source = "contenu", target = "contenu")
    @Mapping(source = "dateObservation", target = "dateObservation")
    ObservationDto toObservationDto(ObservationMedicale observation);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "consultation", ignore = true)
    ObservationMedicale toObservationEntity(ObservationDto observationDto);

    // --- Document Mappings ---
    DocumentMedicalDto toDocumentDto(DocumentMedical document);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dossier", ignore = true)
    @Mapping(target = "consultation", ignore = true)
    @Mapping(target = "chemin", ignore = true)
    DocumentMedical toDocumentEntity(DocumentMedicalDto documentDto);

    // --- Ordonnance Mappings ---
    OrdonnanceDto toOrdonnanceDto(Ordonnance ordonnance);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "consultation", ignore = true)
    Ordonnance toOrdonnanceEntity(OrdonnanceDto ordonnanceDto);

    LigneOrdonnanceDto toLigneDto(LigneOrdonnance ligne);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ordonnance", ignore = true)
    LigneOrdonnance toLigneEntity(LigneOrdonnanceDto ligneDto);
    List<OrdonnanceDto> toOrdonnanceDtoList(List<Ordonnance> ordonnances);

    // --- Secretary Mapping (Restreinte) ---
    @Mapping(source = "dossierMedical.id", target = "dossierId")
    SecretaryPatientDto toSecretaryDto(Patient patient);

    List<SecretaryPatientDto> toSecretaryDtoList(List<Patient> patients);
}
