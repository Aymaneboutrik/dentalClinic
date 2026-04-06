using StockApi.DTOs;
using StockApi.Models;

namespace StockApi.Mappers
{
    public static class ProduitMapper
    {
        // DTO -> Entity
        public static Produit ToEntity(ProduitDto dto)
        {
            return new Produit
            {
                Id = dto.Id,
                Nom = dto.Nom,
                Description = dto.Description,
                Quantite = dto.Quantite,
                SeuilAlerte = dto.SeuilAlerte,
                DatePeremption = dto.DatePeremption
            };
        }

        // Entity -> DTO
        public static ProduitDto ToDto(Produit entity)
        {
            return new ProduitDto
            {
                Id = entity.Id,
                Nom = entity.Nom,
                Description = entity.Description,
                Quantite = entity.Quantite,
                SeuilAlerte = entity.SeuilAlerte,
                DatePeremption = entity.DatePeremption
            };
        }
    }
}