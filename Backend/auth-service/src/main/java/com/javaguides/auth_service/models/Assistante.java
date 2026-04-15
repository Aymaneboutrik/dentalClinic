package com.javaguides.auth_service.models;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.DiscriminatorValue;

@Entity
@Table(name = "assistante")
@PrimaryKeyJoinColumn(name = "id_utilisateur")
@DiscriminatorValue("Assistante")
public class Assistante extends Utilisateur {
}
