using StockApi.DTOs;
using StockApi.Models;

namespace StockApi.Mappers
{
    public static class FournisseurMapper
    {
        public static FournisseurDto ToDto(Fournisseur entity)
        {
            return new FournisseurDto
            {
                Id = entity.Id,
                Nom = entity.Nom,
                Adresse = entity.Adresse,
                Telephone = entity.Telephone
            };
        }

        public static Fournisseur ToEntity(FournisseurDto dto)
        {
            return new Fournisseur
            {
                Id = dto.Id,
                Nom = dto.Nom,
                Adresse = dto.Adresse,
                Telephone = dto.Telephone
            };
        }
    }
}