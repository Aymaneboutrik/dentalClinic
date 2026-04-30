using StockApi.DTOs;
using StockApi.Models;

namespace StockApi.Mappers
{
    public static class MouvementStockMapper
    {
        public static MouvementStockDto ToDto(MouvementStock entity)
        {
            return new MouvementStockDto
            {
                Id = entity.Id,
                TypeMouvement = entity.TypeMouvement,
                Quantite = entity.Quantite,
                DateMouvement = entity.DateMouvement,
                ProduitId = entity.ProduitId,
                LigneCommandeId = entity.LigneCommandeId,
                ProduitActif = entity.Produit?.Actif ?? false
            };
        }

        public static MouvementStock ToEntity(MouvementStockDto dto)
        {
            return new MouvementStock
            {
                Id = dto.Id,
                TypeMouvement = dto.TypeMouvement,
                Quantite = dto.Quantite,
                DateMouvement = dto.DateMouvement,
                ProduitId = dto.ProduitId,
                LigneCommandeId = dto.LigneCommandeId
            };
        }
    }
}