using Service_Personnel.DTOS.Horaires;
using Service_Personnel.Mappers.Horaires;
using Service_Personnel.Models;
using Xunit;

namespace Service_Personnel.Tests.Mappers
{
    public class HoraireMapperTests
    {
        [Fact]
        public void ToEntity_Should_Map_All_Fields_Correctly()
        {
            // On prépare un DTO avec des valeurs valides
            var dto = new CreateHoraireRequestDto
            {
                Jour = Enums.Horaires.JourSemaine.Lundi,
                HeureDebut = new TimeOnly(8, 0),
                HeureFin = new TimeOnly(17, 0),
                IdEmploye = 1
            };

            // On appelle la méthode du mapper
            Horaire result = HoraireMapper.ToEntity(dto);

            // On vérifie que toutes les propriétés sont correctement mappées
            Assert.NotNull(result);

            Assert.Equal(dto.Jour!.Value, result.Jour);
            Assert.Equal(dto.HeureDebut!.Value, result.HeureDebut);
            Assert.Equal(dto.HeureFin!.Value, result.HeureFin);
            Assert.Equal(dto.IdEmploye, result.IdEmploye);
        }
    }
}