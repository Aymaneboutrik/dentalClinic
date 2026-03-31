using System;

namespace StockApi.Models
{
    public class Sortie
    {
        public int Id { get; set; }                 // Clé primaire
        public DateTime DateSortie { get; set; }    // Date de sortie
        public int ProduitId { get; set; }          // Référence au produit
        public int Quantite { get; set; }           // Quantité sortie
    }
}