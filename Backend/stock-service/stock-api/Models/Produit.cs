using System;
using System.Collections.Generic;

namespace StockApi.Models
{
    public class Produit
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantite { get; set; }
        public int SeuilAlerte { get; set; }
        public DateTime DatePeremption { get; set; }
        public bool Actif { get; set; } = false;

        public ICollection<LigneCommande> Lignes { get; set; } = new List<LigneCommande>();
    }
}