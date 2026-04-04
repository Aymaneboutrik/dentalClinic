package com.dental.patient.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "consultations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_consultation")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateConsultation;

    private String motif;

    @ManyToOne
    @JoinColumn(name = "dossier_id")
    private DossierMedical dossier;

    @Column(name = "utilisateur_id")
    private Long dentistId; // To simplify, since User entity might be in another service

    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL)
    @JsonManagedReference("consultation-observation")
    @Builder.Default
    private List<ObservationMedicale> observations = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "consultation_actes",
            joinColumns = @JoinColumn(name = "consultation_id"),
            inverseJoinColumns = @JoinColumn(name = "acte_id")
    )
    @Builder.Default
    private List<Acte> actes = new ArrayList<>();

    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL)
    @JsonManagedReference("consultation-document")
    @Builder.Default
    private List<DocumentMedical> documents = new ArrayList<>();

    @OneToOne(mappedBy = "consultation", cascade = CascadeType.ALL)
    @JsonManagedReference("consultation-ordonnance")
    private Ordonnance ordonnance;

    @PrePersist
    protected void onCreate() {
        if (dateConsultation == null) {
            dateConsultation = LocalDateTime.now();
        }
    }
}
