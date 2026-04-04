package com.dental.patient.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    private String adresse;

    private String telephone;

    private String email;

    @Column(unique = true)
    private String cin;

    private String sexe;

    private String profession;

    @Column(name = "groupe_sanguin")
    private String groupeSanguin;

    @OneToOne(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonManagedReference("patient-dossier")
    private DossierMedical dossierMedical;
}
