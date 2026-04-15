using StockApi.DTOs;
using StockApi.Models;

namespace StockApi.Mappers
{
    public static class SortieMapper
    {
        public static SortieDto ToDto(Sortie sortie)
        {
            return new SortieDto
            {
                DateSortie = sortie.DateSortie,
                ProduitId = sortie.ProduitId,
                Quantite = sortie.Quantite
            };
        }

        public static Sortie ToEntity(SortieDto dto)
        {
            return new Sortie
            {
                DateSortie = dto.DateSortie,
                ProduitId = dto.ProduitId,
                Quantite = dto.Quantite
            };
        }
    }
}