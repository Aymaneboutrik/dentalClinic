using Moq;
using Service_Rendez_vous.DTOs;
using Service_Rendez_vous.Exceptions;
using Service_Rendez_vous.Models;
using Service_Rendez_vous.Repositories.Interfaces;
using Service_Rendez_vous.Services;
using Xunit;
using System;
using System.Threading.Tasks;

namespace Service_Rendez_vous.Tests
{
    public class RendezVousServiceTests
    {
        private readonly Mock<IRendezVousRepository> _repositoryMock;
        private readonly RendezVousService _service;

        public RendezVousServiceTests()
        {
            _repositoryMock = new Mock<IRendezVousRepository>();
            _service = new RendezVousService(_repositoryMock.Object);
        }

        [Fact]
        public async Task CreateAsync_ValidData_ShouldReturnCreatedRdv()
        {
            // Arrange
            var dto = new CreateRendezVousDto
            {
                PatientId = 1,
                DentisteId = 1,
                Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
                HeureDebut = new TimeSpan(10, 0, 0),
                Motif = "Test",
                HeureFinPrevue = new TimeSpan(11, 0, 0)
            };

            var expectedModel = new RendezVous { Id = 1, PatientId = 1, StatutId = 1 };

            _repositoryMock.Setup(repo => repo.AddAsync(It.IsAny<RendezVous>()))
                .ReturnsAsync(expectedModel);

            // Act
            var result = await _service.CreateAsync(dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            _repositoryMock.Verify(repo => repo.AddAsync(It.IsAny<RendezVous>()), Times.Once);
            _repositoryMock.Verify(repo => repo.AddHistoriqueAsync(It.IsAny<HistoriqueRDV>()), Times.Once);
        }

        [Fact]
        public async Task CreateAsync_PastDate_ShouldThrowBusinessRuleException()
        {
            // Arrange
            var dto = new CreateRendezVousDto
            {
                Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1))
            };

            // Act & Assert
            await Assert.ThrowsAsync<BusinessRuleException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task GetByIdAsync_ExistingId_ShouldReturnDto()
        {
            // Arrange
            var rdv = new RendezVous { Id = 1, PatientId = 10 };
            _repositoryMock.Setup(repo => repo.GetByIdAsync(1)).ReturnsAsync(rdv);

            // Act
            var result = await _service.GetByIdAsync(1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(10, result.PatientId);
        }

        [Fact]
        public async Task GetByIdAsync_NonExistingId_ShouldThrowNotFoundException()
        {
            // Arrange
            _repositoryMock.Setup(repo => repo.GetByIdAsync(99)).ReturnsAsync((RendezVous)null);

            // Act & Assert
            await Assert.ThrowsAsync<RendezVousNotFoundException>(() => _service.GetByIdAsync(99));
        }

        [Fact]
        public async Task CancelAsync_ShouldChangeStatusToCancelled()
        {
            // Arrange
            var rdv = new RendezVous { Id = 1, StatutId = 1 };
            _repositoryMock.Setup(repo => repo.GetByIdAsync(1)).ReturnsAsync(rdv);

            // Act
            await _service.CancelAsync(1, "1");

            // Assert
            Assert.Equal(3, rdv.StatutId); // 3 = Annulé
            _repositoryMock.Verify(repo => repo.UpdateAsync(rdv), Times.Once);
            _repositoryMock.Verify(repo => repo.AddHistoriqueAsync(It.IsAny<HistoriqueRDV>()), Times.Once);
        }
    }
}
