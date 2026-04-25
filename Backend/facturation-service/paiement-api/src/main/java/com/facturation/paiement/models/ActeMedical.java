package com.facturation.paiement.models;

import com.facturation.paiement.enums.TypeActe;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "acte_medical")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActeMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "libelle", nullable = false)
    private String libelle;

    @Column(name = "prix", nullable = false)
    private Double prix;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_acte", nullable = false)
    private TypeActe typeActe;
}
