using System;
using StockApi.Models; // pour TypeMouvement
using StockApi.Enums;

namespace StockApi.DTOs
{
    public class MouvementStockDto
    {
        public int Id { get; set; }
        public TypeMouvement TypeMouvement { get; set; }
        public int Quantite { get; set; }
        public DateTime DateMouvement { get; set; }

        public int? ProduitId { get; set; }
        public int? LigneCommandeId { get; set; }
        public bool ProduitActif { get; set; }
    }
}