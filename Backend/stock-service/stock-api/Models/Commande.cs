using System;
using System.Collections.Generic;
using StockApi.Enums;

namespace StockApi.Models
{
    public class Commande
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public OrderStatus Statut { get; set; } = OrderStatus.EnAttente;

        // Relation Fournisseur
        public int FournisseurId { get; set; }
        public Fournisseur? Fournisseur { get; set; }

        // Relation One-to-Many
        public ICollection<LigneCommande> Lignes { get; set; } = new List<LigneCommande>();
    }
}