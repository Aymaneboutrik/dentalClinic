using Service_Personnel.DTOS.Horaires;
using Service_Personnel.Models;

namespace Service_Personnel.Mappers.Horaires
{
    public static class HoraireMapper
    {
        public static Horaire ToEntity(CreateHoraireRequestDto dto)
        {
            return new Horaire
            {
                Jour = dto.Jour!.Value,
                HeureDebut = dto.HeureDebut!.Value,
                HeureFin = dto.HeureFin!.Value, 
                IdEmploye = dto.IdEmploye
            };
        }
    }
}