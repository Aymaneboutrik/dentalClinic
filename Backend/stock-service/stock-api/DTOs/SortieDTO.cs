using System;

namespace StockApi.DTOs
{
    public class SortieDto
    {
        public int Id { get; set; }
        public DateTime DateSortie { get; set; }
        public int ProduitId { get; set; }
        public int Quantite { get; set; }
    }
}