using System;
using StockApi.Enums;

namespace StockApi.Models
{
    public class LigneCommande
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public int Quantite { get; set; }
        public decimal PrixUnitaire { get; set; }
        public EtatLigneCommande Etat { get; set; } = EtatLigneCommande.NonAjoutee;

        // Sous-total calculé automatiquement
        public decimal SousTotal => Quantite * PrixUnitaire;

        // Relation avec Commande
        public int CommandeId { get; set; }
        public Commande? Commande { get; set; }
    }
}