using StockApi.DTOs;
using StockApi.Models;

namespace StockApi.Mappers
{
    public static class CommandeMapper
    {
        public static CommandeDto ToDto(Commande entity)
        {
            return new CommandeDto
            {
                Id = entity.Id,
                Nom = entity.Nom,
                Date = entity.Date,
                Statut = entity.Statut,
                FournisseurId = entity.FournisseurId
            };
        }

        public static Commande ToEntity(CommandeDto dto)
        {
            return new Commande
            {
                Id = dto.Id,
                Nom = dto.Nom,
                Date = dto.Date,
                Statut = dto.Statut,
                FournisseurId = dto.FournisseurId
            };
        }
    }
}