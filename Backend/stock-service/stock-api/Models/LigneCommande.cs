using System;

namespace StockApi.Models
{
    public class LigneCommande
    {
        public int Id { get; set; }
        public int Quantite { get; set; }
        public decimal PrixUnitaire { get; set; }

        // Sous-total calculé automatiquement
        public decimal SousTotal => Quantite * PrixUnitaire;

        // Relation avec Commande
        public int CommandeId { get; set; }
        public Commande? Commande { get; set; }
        
        // Relation avec Produit
        public int ProduitId { get; set; }
        public Produit? Produit { get; set; }
    }
}