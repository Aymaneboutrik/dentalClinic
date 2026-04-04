package com.dental.patient.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    private String type;

    @Column(nullable = false)
    private String chemin;

    @Column(name = "date_ajout")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateAjout;

    @ManyToOne
    @JoinColumn(name = "consultation_id")
    @JsonBackReference("consultation-document")
    private Consultation consultation;

    @ManyToOne
    @JoinColumn(name = "dossier_id")
    @JsonBackReference("dossier-document")
    private DossierMedical dossier;

    @PrePersist
    protected void onCreate() {
        dateAjout = LocalDateTime.now();
    }
}
