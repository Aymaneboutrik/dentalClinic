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
				Nom = entity.Nom,
				Quantite = entity.Quantite,
				PrixUnitaire = entity.PrixUnitaire,
				SousTotal = entity.SousTotal,
				CommandeId = entity.CommandeId,
				Etat = entity.Etat
			};
		}

		public static LigneCommande ToEntity(LigneCommandeDto dto)
		{
			return new LigneCommande
			{
				Id = dto.Id,
				Nom = dto.Nom,
				Quantite = dto.Quantite,
				PrixUnitaire = dto.PrixUnitaire,
				CommandeId = dto.CommandeId,
				Etat = dto.Etat
			};
		}
	}
}