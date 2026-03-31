using GestionRH.DTOs.Horaire;
using Moq;
using Service_Personnel.DTOS.Horaires;
using Service_Personnel.Enums;
using Service_Personnel.Enums.Horaires;
using Service_Personnel.Exceptions;
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.Employees;
using Service_Personnel.Repositories.Interfaces.Horaires;
using Service_Personnel.Services.Horaires;
using System.Threading;
using Xunit;

namespace Service_Personnel.Tests.Services
{
    public class HoraireServiceTests
    {
        private readonly Mock<IHoraireRepository> _horaireRepoMock;
        private readonly Mock<IEmployeeRepository> _employeeRepoMock;
        private readonly HoraireService _service;

        public HoraireServiceTests()
        {
            // Initialisation des mocks et du service à tester
            _horaireRepoMock = new Mock<IHoraireRepository>();
            _employeeRepoMock = new Mock<IEmployeeRepository>();

            _service = new HoraireService(
                _horaireRepoMock.Object,
                _employeeRepoMock.Object
            );
        }

        [Fact]
        public async Task CreateAsync_Should_Throw_When_Employee_Not_Found()
        {
            // Création d’un DTO avec un employé inexistant
            var dto = new CreateHoraireRequestDto
            {
                IdEmploye = 1,
                HeureDebut = new TimeOnly(8, 0),
                HeureFin = new TimeOnly(17, 0)
            };

            // Simulation : l’employé n’existe pas en base
            _employeeRepoMock
                .Setup(r => r.GetByIdAsync(dto.IdEmploye, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employe?)null);

            // Vérification que le service lance une exception métier
            await Assert.ThrowsAsync<ApiException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task CreateAsync_Should_Throw_When_Time_Invalid()
        {
            // Création d’un DTO avec une heure invalide (début > fin)
            var dto = new CreateHoraireRequestDto
            {
                IdEmploye = 1,
                HeureDebut = new TimeOnly(17, 0),
                HeureFin = new TimeOnly(8, 0)
            };

            // Simulation : l’employé existe
            _employeeRepoMock
                .Setup(r => r.GetByIdAsync(dto.IdEmploye, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Employe());

            // Vérification de la règle métier (heure invalide)
            await Assert.ThrowsAsync<ApiException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task CreateAsync_Should_Throw_When_Overlap_Exists()
        {
            // Création d’un DTO valide mais avec conflit d’horaire
            var dto = new CreateHoraireRequestDto
            {
                IdEmploye = 1,
                Jour = JourSemaine.Lundi,
                HeureDebut = new TimeOnly(8, 0),
                HeureFin = new TimeOnly(17, 0)
            };

            // Simulation : employé existant
            _employeeRepoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Employe());

            // Simulation : conflit détecté en base
            _horaireRepoMock
                .Setup(r => r.ExistsOverlapAsync(
                    It.IsAny<int>(),
                    It.IsAny<JourSemaine>(),
                    It.IsAny<TimeOnly>(),
                    It.IsAny<TimeOnly>(),
                    null,
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Vérification que le service bloque la création
            await Assert.ThrowsAsync<ApiException>(() => _service.CreateAsync(dto));
        }

        [Fact]
        public async Task UpdateAsync_Should_Throw_When_Not_Found()
        {
            // Simulation : aucun horaire trouvé en base
            _horaireRepoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
                .ReturnsAsync((Horaire?)null);

            var dto = new UpdateHoraireRequestDto();

            // Vérification que le service retourne une erreur NotFound
            await Assert.ThrowsAsync<ApiException>(() => _service.UpdateAsync(1, dto));
        }

        [Fact]
        public async Task UpdateAsync_Should_Throw_When_Time_Invalid()
        {
            // Simulation d’un horaire existant
            var horaire = new Horaire
            {
                HeureDebut = new TimeOnly(8, 0),
                HeureFin = new TimeOnly(17, 0)
            };

            _horaireRepoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
                .ReturnsAsync(horaire);

            // Modification invalide (heure début après fin)
            var dto = new UpdateHoraireRequestDto
            {
                HeureDebut = new TimeSpan(18, 0, 0)
            };

            // Vérification de la règle métier après modification
            await Assert.ThrowsAsync<ApiException>(() => _service.UpdateAsync(1, dto));
        }

        [Fact]
        public async Task DeleteAsync_Should_Throw_When_Not_Found()
        {
            // Simulation : horaire inexistant
            _horaireRepoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
                .ReturnsAsync((Horaire?)null);

            // Vérification que la suppression échoue
            await Assert.ThrowsAsync<ApiException>(() => _service.DeleteAsync(1));
        }
    }
}