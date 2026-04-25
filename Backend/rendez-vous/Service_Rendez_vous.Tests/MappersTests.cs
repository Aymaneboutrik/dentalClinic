using Service_Rendez_vous.DTOs;
using Service_Rendez_vous.Mappers;
using Service_Rendez_vous.Models;
using Xunit;

namespace Service_Rendez_vous.Tests
{
    public class MappersTests
    {
        [Fact]
        public void RendezVousMapper_ToDto_ShouldMapCorrectly()
        {
            // Arrange
            var model = new RendezVous
            {
                Id = 1,
                PatientId = 10,
                DentisteId = 2,
                Date = new DateOnly(2026, 5, 20),
                HeureDebut = new TimeSpan(10, 0, 0),
                Motif = "Test",
                StatutId = 1,
                HeureFinPrevue = new TimeSpan(11, 0, 0)
            };

            // Act
            var dto = RendezVousMapper.ToDto(model);

            // Assert
            Assert.NotNull(dto);
            Assert.Equal(model.Id, dto.Id);
            Assert.Equal(model.PatientId, dto.PatientId);
            Assert.Equal(model.Date, dto.Date);
            Assert.Equal(model.Motif, dto.Motif);
        }

        [Fact]
        public void HistoriqueRDVMapper_ToDto_ShouldMapCorrectly()
        {
            // Arrange
            var model = new HistoriqueRDV
            {
                Id = 1,
                RendezVousId = 1,
                AncienStatut = "1",
                NouveauStatut = "2",
                DateModification = System.DateTime.Now,
                ModifiePar = 1,
                TypeModification = "Test"
            };

            // Act
            var dto = HistoriqueRDVMapper.ToDto(model);

            // Assert
            Assert.NotNull(dto);
            Assert.Equal(model.AncienStatut, dto.AncienStatut);
            Assert.Equal(model.NouveauStatut, dto.NouveauStatut);
            Assert.Equal(model.TypeModification, dto.TypeModification);
        }
    }
}
