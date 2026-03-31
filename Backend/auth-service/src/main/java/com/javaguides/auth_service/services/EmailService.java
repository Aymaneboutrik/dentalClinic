package com.javaguides.auth_service.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Réinitialisation de votre mot de passe");

        // Lien cliquable pour réinitialiser le mot de passe
        // Dans une vraie application, cela pointera vers votre application frontend
        // (ex: React, Angular, Vue)
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;

        message.setText("Bonjour,\n\n"
                + "Vous avez demandé la réinitialisation de votre mot de passe.\n"
                + "Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe (valide 15 minutes) :\n\n"
                + resetUrl + "\n\n"
                + "Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.");

        mailSender.send(message);
    }
}
