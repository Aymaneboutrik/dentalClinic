using StockApi.DTOs;
using StockApi.Models;

namespace StockApi.Mappers
{
    public static class CommandeValidationMapper
    {
        public static CommandeValidationDto ToDto(CommandeValidation entity)
        {
            return new CommandeValidationDto
            {
                Id = entity.Id,
                TypeAction = entity.TypeAction,
                Commentaire = entity.Commentaire,
                DateValidation = entity.DateValidation
            };
        }

        public static CommandeValidation ToEntity(CommandeValidationDto dto)
        {
            return new CommandeValidation
            {
                Id = dto.Id,
                TypeAction = dto.TypeAction,
                Commentaire = dto.Commentaire,
                DateValidation = dto.DateValidation
            };
        }
    }
}