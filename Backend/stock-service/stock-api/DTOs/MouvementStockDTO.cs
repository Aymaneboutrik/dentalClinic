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
        public DateTime? DateMouvement { get; set; }  // null par défaut = "à saisir"

        public int? ProduitId { get; set; }
        public int? CommandeId { get; set; }
    }
}