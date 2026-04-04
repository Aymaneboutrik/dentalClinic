package com.dental.patient.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dossiers_medicaux")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DossierMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_creation")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateCreation;

    @Column(name = "code_dossier", unique = true, nullable = false)
    private String codeDossier;

    @Builder.Default
    private boolean archived = false;

    @OneToOne
    @JoinColumn(name = "patient_id")
    @JsonBackReference("patient-dossier")
    private Patient patient;

    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL)
    @JsonManagedReference("dossier-document")
    @Builder.Default
    private List<DocumentMedical> documents = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
