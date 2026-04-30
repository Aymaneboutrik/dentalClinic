using System;

namespace StockApi.Services
{
    public class NotificationService
    {
        public virtual void EnvoyerNotification(string role, string message)
        {
            // Pour le moment on logge dans la console, peut être remplacé par un vrai push
            Console.WriteLine($"Notification pour {role}: {message}");
        }

        public void AlertePeremption(string nomProduit, DateTime datePeremption)
        {
            EnvoyerNotification("Secretaire", $"Alerte péremption: Le produit '{nomProduit}' arrive à expiration le {datePeremption:yyyy-MM-dd}.");
        }

        public void AlerteSeuilCritique(string nomProduit, int quantiteActuelle, int seuil)
        {
            EnvoyerNotification("Secretaire", $"Alerte stock critique: Le produit '{nomProduit}' a atteint le seuil d'alerte ({quantiteActuelle}/{seuil}).");
        }

        public void AlerteStockEpuise(string nomProduit)
        {
            EnvoyerNotification("Secretaire", $"Alerte stock épuisé: Le produit '{nomProduit}' est en rupture de stock.");
        }
    }
}