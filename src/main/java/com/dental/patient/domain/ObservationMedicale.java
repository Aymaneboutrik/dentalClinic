package com.dental.patient.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "observations_medicales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObservationMedicale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String contenu;

    @Column(name = "type_auteur")
    private String typeAuteur;

    @Column(name = "date_observation")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateObservation;

    @ManyToOne
    @JoinColumn(name = "consultation_id")
    @JsonBackReference("consultation-observation")
    private Consultation consultation;

    @PrePersist
    protected void onCreate() {
        if (dateObservation == null) {
            dateObservation = LocalDateTime.now();
        }
        if (typeAuteur == null) {
            typeAuteur = "DENTISTE";
        }
    }
}
