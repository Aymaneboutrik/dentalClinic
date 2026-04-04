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
@Table(name = "ordonnances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ordonnance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date_ordonnance")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateOrdonnance;

    @OneToOne
    @JoinColumn(name = "consultation_id")
    @JsonBackReference("consultation-ordonnance")
    private Consultation consultation;

    @OneToMany(mappedBy = "ordonnance", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("ordonnance-ligne")
    @Builder.Default
    private List<LigneOrdonnance> lignes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dateOrdonnance = LocalDateTime.now();
    }
}
