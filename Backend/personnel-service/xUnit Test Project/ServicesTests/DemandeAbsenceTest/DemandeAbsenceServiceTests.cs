using FluentAssertions;
using Moq;
using Service_Personnel.DTOS;
using Service_Personnel.DTOS.DemandeAbsence;
using Service_Personnel.Exceptions;
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.Absences;
using Service_Personnel.Repositories.Interfaces.DemandesAbsence;
using Service_Personnel.Repositories.Interfaces.Employees;
using Service_Personnel.Services.DemandeAbsence;
using Xunit;

namespace Service_Personnel.Tests.Services
{
    public class DemandeAbsenceServiceTests
    {
        // --------------------------------------------------------------------
        // Déclaration des mocks
        // --------------------------------------------------------------------
        // Ici on simule les dépendances du service :
        // - repository des demandes d'absence
        // - repository des employés
        // - repository des absences
        // Ainsi, on teste uniquement la logique métier du service
        // sans dépendre de la base de données réelle.
        private readonly Mock<IDemandeAbsenceRepository> _demandeRepoMock;
        private readonly Mock<IEmployeeRepository> _employeeRepoMock;
        private readonly Mock<IAbsenceRepository> _absenceRepoMock;

        // --------------------------------------------------------------------
        // Service à tester
        // --------------------------------------------------------------------
        private readonly DemandeAbsenceService _service;

        public DemandeAbsenceServiceTests()
        {
            // Initialisation des mocks
            _demandeRepoMock = new Mock<IDemandeAbsenceRepository>();
            _employeeRepoMock = new Mock<IEmployeeRepository>();
            _absenceRepoMock = new Mock<IAbsenceRepository>();

            // Injection des mocks dans le service
            _service = new DemandeAbsenceService(
                _demandeRepoMock.Object,
                _employeeRepoMock.Object,
                _absenceRepoMock.Object
            );
        }

        // ====================================================================
        // TESTS DE CreateAsync
        // ====================================================================

        [Fact]
        public async Task CreateAsync_Should_Create_Demande_When_Data_Is_Valid()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            // On prépare un employé existant
            var employe = new Employe
            {
                IdEmploye = 1,
                Nom = "Aymane",
                Prenom = "Boutrik"
            };

            // On prépare un DTO valide
            var dto = new CreateDemandeAbsenceDto
            {
                DateDebut = DateTime.UtcNow.AddDays(2),
                DateFin = DateTime.UtcNow.AddDays(5),
                TypeDemande = "Congé annuel",
                Motif = "Repos"
            };

            // On dit au mock employee repository :
            // quand le service appelle GetByIdAsync(1),
            // retourne l'employé préparé ci-dessus.
            _employeeRepoMock
                .Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employe);

            // Ici on veut aussi simuler le comportement du repository AddAsync
            // pour affecter un IdDemande à l'objet créé.
            _demandeRepoMock
                .Setup(repo => repo.AddAsync(It.IsAny<DemandeAbsence>(), It.IsAny<CancellationToken>()))
                .Callback<DemandeAbsence, CancellationToken>((demande, ct) =>
                {
                    demande.IdDemande = 10;
                })
                .Returns(Task.CompletedTask);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            var result = await _service.CreateAsync(dto, 1);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------

            // Vérifier que le résultat n'est pas null
            result.Should().NotBeNull();

            // Vérifier que le repository AddAsync a été appelé une seule fois
            _demandeRepoMock.Verify(
                repo => repo.AddAsync(It.IsAny<DemandeAbsence>(), It.IsAny<CancellationToken>()),
                Times.Once);

            // Vérifier que GetByIdAsync a bien été appelé pour vérifier l'existence de l'employé
            _employeeRepoMock.Verify(
                repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task CreateAsync_Should_Throw_ApiException_When_Employee_Not_Found()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var dto = new CreateDemandeAbsenceDto
            {
                DateDebut = DateTime.UtcNow.AddDays(2),
                DateFin = DateTime.UtcNow.AddDays(4),
                TypeDemande = "Congé annuel",
                Motif = "Repos"
            };

            // Ici on simule que l'employé n'existe pas
            _employeeRepoMock
                .Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employe?)null);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.CreateAsync(dto, 1);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Employé introuvable");
            exception.Which.StatusCode.Should().Be(404);
            exception.Which.ErrorCode.Should().Be("EMPLOYEE_NOT_FOUND");

            // Vérifier que la demande n'est jamais ajoutée si l'employé n'existe pas
            _demandeRepoMock.Verify(
                repo => repo.AddAsync(It.IsAny<DemandeAbsence>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task CreateAsync_Should_Throw_ApiException_When_StartDate_Is_In_The_Past()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var employe = new Employe
            {
                IdEmploye = 1,
                Nom = "Aymane",
                Prenom = "Boutrik"
            };

            // Date début dans le passé => cas invalide
            var dto = new CreateDemandeAbsenceDto
            {
                DateDebut = DateTime.UtcNow.AddDays(-1),
                DateFin = DateTime.UtcNow.AddDays(2),
                TypeDemande = "Congé annuel",
                Motif = "Repos"
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employe);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.CreateAsync(dto, 1);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("La date de début ne peut pas être dans le passé");
            exception.Which.StatusCode.Should().Be(400);
            exception.Which.ErrorCode.Should().Be("INVALID_START_DATE");

            _demandeRepoMock.Verify(
                repo => repo.AddAsync(It.IsAny<DemandeAbsence>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

      
        // ====================================================================
        // TESTS DE GetAllAsync
        // ====================================================================

        [Fact]
        public async Task GetAllAsync_Should_Return_All_Demandes_Mapped_To_ResponseDto()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var demandes = new List<DemandeAbsence>
            {
                new DemandeAbsence
                {
                    IdDemande = 1,
                    DateCreation = DateTime.UtcNow,
                    DateDebut = DateTime.UtcNow.AddDays(1),
                    DateFin = DateTime.UtcNow.AddDays(3),
                    TypeDemande = "Congé annuel",
                    Motif = "Voyage",
                    Statut = "EN_ATTENTE",
                    DateTraitement = null,
                    EmployeId = 1,
                    Employe = new Employe
                    {
                        IdEmploye = 1,
                        Nom = "Aymane",
                        Prenom = "Boutrik"
                    }
                }
            };

            _demandeRepoMock
                .Setup(repo => repo.GetAllWithEmployeAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(demandes);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            var result = await _service.GetAllAsync();

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            result.Should().NotBeNull();
            result.Should().HaveCount(1);

            result[0].IdDemande.Should().Be(1);
            result[0].Nom.Should().Be("Aymane");
            result[0].Prenom.Should().Be("Boutrik");
            result[0].TypeDemande.Should().Be("Congé annuel");

            _demandeRepoMock.Verify(
                repo => repo.GetAllWithEmployeAsync(It.IsAny<CancellationToken>()),
                Times.Once);
        }

        // ====================================================================
        // TESTS DE GetByEmployeIdAsync
        // ====================================================================

        [Fact]
        public async Task GetByEmployeIdAsync_Should_Return_Demandes_For_Existing_Employee()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var employe = new Employe
            {
                IdEmploye = 1,
                Nom = "Aymane",
                Prenom = "Boutrik"
            };

            var demandes = new List<DemandeAbsence>
            {
                new DemandeAbsence
                {
                    IdDemande = 2,
                    DateCreation = DateTime.UtcNow,
                    DateDebut = DateTime.UtcNow.AddDays(2),
                    DateFin = DateTime.UtcNow.AddDays(4),
                    TypeDemande = "Maladie",
                    Motif = "Grippe",
                    Statut = "EN_ATTENTE",
                    DateTraitement = null,
                    EmployeId = 1,
                    Employe = employe
                }
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employe);

            _demandeRepoMock
                .Setup(repo => repo.GetByEmployeIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(demandes);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            var result = await _service.GetByEmployeIdAsync(1);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result[0].IdEmploye.Should().Be(1);
            result[0].Nom.Should().Be("Aymane");
            result[0].Prenom.Should().Be("Boutrik");

            _employeeRepoMock.Verify(
                repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()),
                Times.Once);

            _demandeRepoMock.Verify(
                repo => repo.GetByEmployeIdAsync(1, It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task GetByEmployeIdAsync_Should_Throw_ApiException_When_Employee_Not_Found()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            _employeeRepoMock
                .Setup(repo => repo.GetByIdAsync(1, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employe?)null);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.GetByEmployeIdAsync(1);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Employé introuvable");
            exception.Which.StatusCode.Should().Be(404);
            exception.Which.ErrorCode.Should().Be("EMPLOYEE_NOT_FOUND");

            _demandeRepoMock.Verify(
                repo => repo.GetByEmployeIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        // ====================================================================
        // TESTS DE AccepterAsync
        // ====================================================================

        [Fact]
        public async Task AccepterAsync_Should_Accept_Demande_And_Create_Absence_When_Doctor_And_Demande_Valid()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var docteur = new Employe
            {
                IdEmploye = 2,
                Nom = "Docteur",
                Prenom = "Ali",
                Role = new Role
                {
                    IdRole = 2,
                    NomRole = "Docteur"
                }
            };

            var demande = new DemandeAbsence
            {
                IdDemande = 5,
                DateDebut = DateTime.UtcNow.AddDays(2),
                DateFin = DateTime.UtcNow.AddDays(4),
                TypeDemande = "Congé annuel",
                Motif = "Repos",
                Statut = "EN_ATTENTE",
                EmployeId = 1
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(docteur);

            _demandeRepoMock
                .Setup(repo => repo.GetByIdAsync(5, It.IsAny<CancellationToken>()))
                .ReturnsAsync(demande);

            _absenceRepoMock
                .Setup(repo => repo.AddAsync(It.IsAny<Absence>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            _demandeRepoMock
                .Setup(repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            var result = await _service.AccepterAsync(5, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            result.Should().NotBeNull();

            // Vérifier la mise à jour de la demande
            demande.Statut.Should().Be("ACCEPTEE");
            demande.TraiteParId.Should().Be(2);
            demande.DateTraitement.Should().NotBeNull();

            // Vérifier qu'une absence a été créée
            _absenceRepoMock.Verify(
                repo => repo.AddAsync(It.IsAny<Absence>(), It.IsAny<CancellationToken>()),
                Times.Once);

            // Vérifier que SaveChanges est appelé
            _demandeRepoMock.Verify(
                repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task AccepterAsync_Should_Throw_ApiException_When_Traiteur_Not_Found()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employe?)null);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.AccepterAsync(5, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Employé introuvable");
            exception.Which.StatusCode.Should().Be(404);
            exception.Which.ErrorCode.Should().Be("EMPLOYEE_NOT_FOUND");

            _absenceRepoMock.Verify(
                repo => repo.AddAsync(It.IsAny<Absence>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task AccepterAsync_Should_Throw_ApiException_When_Traiteur_Is_Not_Doctor()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var employeNonDocteur = new Employe
            {
                IdEmploye = 2,
                Role = new Role
                {
                    IdRole = 1,
                    NomRole = "Assistant"
                }
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employeNonDocteur);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.AccepterAsync(5, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Seul le docteur peut traiter une demande");
            exception.Which.StatusCode.Should().Be(403);
            exception.Which.ErrorCode.Should().Be("DOCTOR_ROLE_REQUIRED");

            _demandeRepoMock.Verify(
                repo => repo.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task AccepterAsync_Should_Throw_ApiException_When_Demande_Not_Found()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var docteur = new Employe
            {
                IdEmploye = 2,
                Role = new Role
                {
                    IdRole = 2,
                    NomRole = "Docteur"
                }
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(docteur);

            _demandeRepoMock
                .Setup(repo => repo.GetByIdAsync(5, It.IsAny<CancellationToken>()))
                .ReturnsAsync((DemandeAbsence?)null);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.AccepterAsync(5, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Demande introuvable");
            exception.Which.StatusCode.Should().Be(404);
            exception.Which.ErrorCode.Should().Be("DEMANDE_NOT_FOUND");

            _absenceRepoMock.Verify(
                repo => repo.AddAsync(It.IsAny<Absence>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task AccepterAsync_Should_Throw_ApiException_When_Demande_Already_Processed()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var docteur = new Employe
            {
                IdEmploye = 2,
                Role = new Role
                {
                    IdRole = 2,
                    NomRole = "Docteur"
                }
            };

            var demande = new DemandeAbsence
            {
                IdDemande = 5,
                Statut = "ACCEPTEE",
                EmployeId = 1
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(docteur);

            _demandeRepoMock
                .Setup(repo => repo.GetByIdAsync(5, It.IsAny<CancellationToken>()))
                .ReturnsAsync(demande);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.AccepterAsync(5, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Demande déjà traitée");
            exception.Which.StatusCode.Should().Be(400);
            exception.Which.ErrorCode.Should().Be("DEMANDE_ALREADY_PROCESSED");

            _absenceRepoMock.Verify(
                repo => repo.AddAsync(It.IsAny<Absence>(), It.IsAny<CancellationToken>()),
                Times.Never);

            _demandeRepoMock.Verify(
                repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()),
                Times.Never);
        }

        // ====================================================================
        // TESTS DE RefuserAsync
        // ====================================================================

        [Fact]
        public async Task RefuserAsync_Should_Refuse_Demande_When_Doctor_And_Demande_Valid()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var docteur = new Employe
            {
                IdEmploye = 2,
                Role = new Role
                {
                    IdRole = 2,
                    NomRole = "Docteur"
                }
            };

            var demande = new DemandeAbsence
            {
                IdDemande = 7,
                Statut = "EN_ATTENTE",
                EmployeId = 1
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(docteur);

            _demandeRepoMock
                .Setup(repo => repo.GetByIdAsync(7, It.IsAny<CancellationToken>()))
                .ReturnsAsync(demande);

            _demandeRepoMock
                .Setup(repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            var result = await _service.RefuserAsync(7, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            result.Should().NotBeNull();

            demande.Statut.Should().Be("REFUSEE");
            demande.TraiteParId.Should().Be(2);
            demande.DateTraitement.Should().NotBeNull();

            _demandeRepoMock.Verify(
                repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()),
                Times.Once);
        }

        [Fact]
        public async Task RefuserAsync_Should_Throw_ApiException_When_Traiteur_Is_Not_Doctor()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var employeNonDocteur = new Employe
            {
                IdEmploye = 2,
                Role = new Role
                {
                    IdRole = 1,
                    NomRole = "Assistant"
                }
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(employeNonDocteur);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.RefuserAsync(7, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Seul le docteur peut traiter une demande");
            exception.Which.StatusCode.Should().Be(403);
            exception.Which.ErrorCode.Should().Be("DOCTOR_ROLE_REQUIRED");

            _demandeRepoMock.Verify(
                repo => repo.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task RefuserAsync_Should_Throw_ApiException_When_Demande_Not_Found()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var docteur = new Employe
            {
                IdEmploye = 2,
                Role = new Role
                {
                    IdRole = 2,
                    NomRole = "Docteur"
                }
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(docteur);

            _demandeRepoMock
                .Setup(repo => repo.GetByIdAsync(7, It.IsAny<CancellationToken>()))
                .ReturnsAsync((DemandeAbsence?)null);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.RefuserAsync(7, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Demande introuvable");
            exception.Which.StatusCode.Should().Be(404);
            exception.Which.ErrorCode.Should().Be("DEMANDE_NOT_FOUND");

            _demandeRepoMock.Verify(
                repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()),
                Times.Never);
        }

        [Fact]
        public async Task RefuserAsync_Should_Throw_ApiException_When_Demande_Already_Processed()
        {
            // ----------------------------------------------------------------
            // Arrange
            // ----------------------------------------------------------------
            var docteur = new Employe
            {
                IdEmploye = 2,
                Role = new Role
                {
                    IdRole = 2,
                    NomRole = "Docteur"
                }
            };

            var demande = new DemandeAbsence
            {
                IdDemande = 7,
                Statut = "REFUSEE",
                EmployeId = 1
            };

            _employeeRepoMock
                .Setup(repo => repo.GetByIdWithRoleAsync(2, It.IsAny<CancellationToken>()))
                .ReturnsAsync(docteur);

            _demandeRepoMock
                .Setup(repo => repo.GetByIdAsync(7, It.IsAny<CancellationToken>()))
                .ReturnsAsync(demande);

            // ----------------------------------------------------------------
            // Act
            // ----------------------------------------------------------------
            Func<Task> act = async () => await _service.RefuserAsync(7, 2);

            // ----------------------------------------------------------------
            // Assert
            // ----------------------------------------------------------------
            var exception = await act.Should().ThrowAsync<ApiException>();

            exception.Which.Message.Should().Be("Demande déjà traitée");
            exception.Which.StatusCode.Should().Be(400);
            exception.Which.ErrorCode.Should().Be("DEMANDE_ALREADY_PROCESSED");

            _demandeRepoMock.Verify(
                repo => repo.SaveChangesAsync(It.IsAny<CancellationToken>()),
                Times.Never);
        }
    }
}