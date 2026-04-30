using StockApi.DTOs;
using StockApi.Models;

namespace StockApi.Mappers
{
	public static class LigneCommandeMapper
	{
		public static LigneCommandeDto ToDto(LigneCommande entity)
		{
			return new LigneCommandeDto
			{
				Id = entity.Id,
				ProduitId = entity.ProduitId,
				Quantite = entity.Quantite,
				PrixUnitaire = entity.PrixUnitaire,
				SousTotal = entity.SousTotal,
				CommandeId = entity.CommandeId
			};
		}

		public static LigneCommande ToEntity(LigneCommandeDto dto)
		{
			return new LigneCommande
			{
				Id = dto.Id,
				ProduitId = dto.ProduitId,
				Quantite = dto.Quantite,
				PrixUnitaire = dto.PrixUnitaire,
				CommandeId = dto.CommandeId
			};
		}
	}
}