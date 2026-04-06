package com.javaguides.auth_service.models;

import jakarta.persistence.*;

@Entity
@Table(name = "dentiste")
@PrimaryKeyJoinColumn(name = "id_utilisateur")
@DiscriminatorValue("Dentiste")
public class Dentiste extends Utilisateur {

    @Column(length = 50)
    private String specialite;

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }
}
