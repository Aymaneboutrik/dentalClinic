using FluentAssertions; 
using Moq; 
using Service_Personnel.DTOS.Employes; 
using Service_Personnel.Exceptions; 
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.Employees;
using Service_Personnel.Services.Employees;
using Xunit; 

namespace xUnit_Test_Project.ServicesTests.Employee
{
    public class EmployeeServiceTests
    {

        // ============================================================
        // TEST 1
        // si l’email existe déjà → exception
        // ============================================================
        [Fact] 
        public async Task CreateAsync_Should_Throw_ApiException_When_Email_Already_Exists()
        {
            // -------------------- Arrange --------------------
            // préparer les objets nécessaires pour le test

            // création d'un faux repository avec Moq
            var repoMock = new Mock<IEmployeeRepository>();

            // configuration du mock :
            // quand EmailExistsAsync est appelé → retourner true
            // cela simule un email déjà existant dans la base
            repoMock
                .Setup(r => r.EmailExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // création du service avec le mock repository injecté
            var service = new EmployeeService(repoMock.Object);

            // création des données d'entrée (DTO)
            var dto = new CreateEmployeeRequestDto
            {
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1
            };

            // -------------------- Act --------------------
            // on prépare l'appel de la méthode à tester
            Func<Task> act = async () => await service.CreateAsync(dto);

            // -------------------- Assert --------------------
            // vérifier que la méthode lance ApiException
            await act.Should().ThrowAsync<ApiException>();
        }



        // ============================================================
        // TEST 2
        // si le rôle n’existe pas → exception
        // ============================================================
        [Fact]
        public async Task CreateAsync_Should_Throw_ApiException_When_Role_Does_Not_Exist()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // on simule que l'email n'existe pas
            repoMock
                .Setup(r => r.EmailExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // on simule que le rôle n'existe pas
            repoMock
                .Setup(r => r.RoleExistsAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // création du service avec le mock
            var service = new EmployeeService(repoMock.Object);

            // création du DTO
            var dto = new CreateEmployeeRequestDto
            {
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 99
            };

            // -------------------- Act --------------------
            Func<Task> act = async () => await service.CreateAsync(dto);

            // -------------------- Assert --------------------
            await act.Should().ThrowAsync<ApiException>();
        }



        // ============================================================
        // TEST 3
        // si les données sont valides → ajout + sauvegarde
        // ============================================================
        [Fact]
        public async Task CreateAsync_Should_Call_AddAsync_And_SaveChangesAsync_When_Data_Is_Valid()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // on simule que l'email n'existe pas
            repoMock
                .Setup(r => r.EmailExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // on simule que le rôle existe
            repoMock
                .Setup(r => r.RoleExistsAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // simulation de la méthode AddAsync
            repoMock
                .Setup(r => r.AddAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // simulation de SaveChangesAsync
            repoMock
                .Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // création du DTO
            var dto = new CreateEmployeeRequestDto
            {
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1
            };

            // -------------------- Act --------------------
            await service.CreateAsync(dto);

            // -------------------- Assert --------------------

            // vérifier que AddAsync est appelé une fois
            repoMock.Verify(
                r => r.AddAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()),
                Times.Once);

            // vérifier que SaveChangesAsync est appelé une fois
            repoMock.Verify(
                r => r.SaveChangesAsync(It.IsAny<CancellationToken>()),
                Times.Once);
        }



        // ============================================================
        // TEST 4
        // si l’email existe déjà → aucun ajout en base
        // ============================================================
        [Fact]
        public async Task CreateAsync_Should_Not_Call_AddAsync_When_Email_Already_Exists()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // on simule que l'email existe déjà
            repoMock
                .Setup(r => r.EmailExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // création du DTO
            var dto = new CreateEmployeeRequestDto
            {
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1
            };

            // -------------------- Act --------------------
            Func<Task> act = async () => await service.CreateAsync(dto);

            // -------------------- Assert --------------------

            // vérifier qu'une exception est lancée
            await act.Should().ThrowAsync<ApiException>();

            // vérifier que AddAsync n'a jamais été appelé
            repoMock.Verify(
                r => r.AddAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }


        // ============================================================
        // TEST 5
        // si l'employé à modifier n'existe pas → exception
        // ============================================================
        [Fact]
        public async Task UpdateAsync_Should_Throw_ApiException_When_Employee_Not_Found()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // on simule que l'employé n'existe pas dans la base
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employe?)null);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // création du DTO de modification
            var dto = new UpdateEmployeeRequestDto
            {
                Nom = "NouveauNom"
            };

            // -------------------- Act --------------------
            Func<Task> act = async () => await service.UpdateAsync(1, dto);

            // -------------------- Assert --------------------
            await act.Should().ThrowAsync<ApiException>();
        }



        // ============================================================
        // TEST 6
        // si le nouveau rôle n'existe pas → exception
        // ============================================================
        [Fact]
        public async Task UpdateAsync_Should_Throw_ApiException_When_New_Role_Does_Not_Exist()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // employé existant dans la base
            var employee = new Employe
            {
                IdEmploye = 1,
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1,
                Statut = Service_Personnel.Enums.Employees.StatutEmploye.Actif
            };

            // on simule que l'employé existe
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // on simule que le nouveau rôle n'existe pas
            repoMock
                .Setup(r => r.RoleExistsAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // DTO avec changement de rôle
            var dto = new UpdateEmployeeRequestDto
            {
                IdRole = 99
            };

            // -------------------- Act --------------------
            Func<Task> act = async () => await service.UpdateAsync(1, dto);

            // -------------------- Assert --------------------
            await act.Should().ThrowAsync<ApiException>();
        }



        // ============================================================
        // TEST 7
        // si le nouvel email existe déjà → exception
        // ============================================================
        [Fact]
        public async Task UpdateAsync_Should_Throw_ApiException_When_New_Email_Already_Exists()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // employé existant
            var employee = new Employe
            {
                IdEmploye = 1,
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "ancien@test.com",
                Telephone = "0612345678",
                IdRole = 1,
                Statut = Service_Personnel.Enums.Employees.StatutEmploye.Actif
            };

            // on simule que l'employé existe
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // on simule que le nouvel email existe déjà dans la base
            repoMock
                .Setup(r => r.EmailExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // DTO avec nouvel email différent de l'ancien
            var dto = new UpdateEmployeeRequestDto
            {
                Email = "nouveau@test.com"
            };

            // -------------------- Act --------------------
            Func<Task> act = async () => await service.UpdateAsync(1, dto);

            // -------------------- Assert --------------------
            await act.Should().ThrowAsync<ApiException>();
        }



        // ============================================================
        // TEST 8
        // si les données sont valides → UpdateAsync du repository est appelé
        // ============================================================
        [Fact]
        public async Task UpdateAsync_Should_Call_UpdateAsync_When_Data_Is_Valid()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // employé existant
            var employee = new Employe
            {
                IdEmploye = 1,
                Nom = "AncienNom",
                Prenom = "AncienPrenom",
                Email = "ancien@test.com",
                Telephone = "0612345678",
                IdRole = 1,
                Statut = Service_Personnel.Enums.Employees.StatutEmploye.Actif
            };

            // on simule que l'employé existe
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // on simule que le nouveau rôle existe
            repoMock
                .Setup(r => r.RoleExistsAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // on simule que le nouvel email n'existe pas
            repoMock
                .Setup(r => r.EmailExistsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            // on simule la mise à jour
            repoMock
                .Setup(r => r.UpdateAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // DTO avec des nouvelles valeurs valides
            var dto = new UpdateEmployeeRequestDto
            {
                Nom = "NouveauNom",
                Email = "nouveau@test.com",
                IdRole = 2
            };

            // -------------------- Act --------------------
            await service.UpdateAsync(1, dto);

            // -------------------- Assert --------------------

            // vérifier que UpdateAsync du repository a bien été appelé une seule fois
            repoMock.Verify(
                r => r.UpdateAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()),
                Times.Once);
        }



        // ============================================================
        // TEST 9
        // si les données sont valides → retourner un message de succès
        // ============================================================
        [Fact]
        public async Task UpdateAsync_Should_Return_Success_Message_When_Data_Is_Valid()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // employé existant
            var employee = new Employe
            {
                IdEmploye = 1,
                Nom = "AncienNom",
                Prenom = "AncienPrenom",
                Email = "ancien@test.com",
                Telephone = "0612345678",
                IdRole = 1,
                Statut = Service_Personnel.Enums.Employees.StatutEmploye.Actif
            };

            // on simule que l'employé existe
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // on simule la mise à jour
            repoMock
                .Setup(r => r.UpdateAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // DTO avec une modification simple
            var dto = new UpdateEmployeeRequestDto
            {
                Nom = "NouveauNom"
            };

            // -------------------- Act --------------------
            var result = await service.UpdateAsync(1, dto);

            // -------------------- Assert --------------------

            // récupérer la propriété Message de l'objet anonyme retourné
            var messageProperty = result.GetType().GetProperty("Message");
            var messageValue = messageProperty?.GetValue(result)?.ToString();

            messageValue.Should().Be("Employé modifié avec succès");
        }



        // ============================================================
        // TEST 10
        // si l'employé existe → suppression appelée
        // ============================================================
        [Fact]
        public async Task DeleteAsync_Should_Call_DeleteAsync_When_Employee_Exists()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // employé existant
            var employee = new Employe
            {
                IdEmploye = 1,
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1,
                Statut = Service_Personnel.Enums.Employees.StatutEmploye.Actif
            };

            // on simule que l'employé existe
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // on simule la suppression
            repoMock
                .Setup(r => r.DeleteAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // -------------------- Act --------------------
            await service.DeleteAsync(1);

            // -------------------- Assert --------------------

            // vérifier que DeleteAsync a été appelé une seule fois
            repoMock.Verify(
                r => r.DeleteAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()),
                Times.Once);
        }



        // ============================================================
        // TEST 11
        // si l'employé n'existe pas → exception
        // ============================================================
        [Fact]
        public async Task DeleteAsync_Should_Throw_ApiException_When_Employee_Not_Found()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // on simule que l'employé n'existe pas
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employe?)null);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // -------------------- Act --------------------
            Func<Task> act = async () => await service.DeleteAsync(1);

            // -------------------- Assert --------------------
            await act.Should().ThrowAsync<ApiException>();

            // vérifier que DeleteAsync n'a jamais été appelé
            repoMock.Verify(
                r => r.DeleteAsync(It.IsAny<Employe>(), It.IsAny<CancellationToken>()),
                Times.Never);
        }



        // ============================================================
        // TEST 12
        // si l'employé existe → retourner EmployeeResponseDto
        // ============================================================
        [Fact]
        public async Task GetByIdAsync_Should_Return_EmployeeResponseDto_When_Employee_Exists()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // employé existant avec son rôle
            var employee = new Employe
            {
                IdEmploye = 1,
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1,
                Statut = Service_Personnel.Enums.Employees.StatutEmploye.Actif,
                Role = new Role
                {
                    NomRole = "Manager"
                }
            };

            // on simule que l'employé existe
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(employee);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // -------------------- Act --------------------
            var result = await service.GetByIdAsync(1);

            // -------------------- Assert --------------------
            result.Should().NotBeNull();
            result.IdEmploye.Should().Be(employee.IdEmploye);
            result.Nom.Should().Be(employee.Nom);
            result.Prenom.Should().Be(employee.Prenom);
            result.Email.Should().Be(employee.Email);
            result.Telephone.Should().Be(employee.Telephone);
            result.Statut.Should().Be(employee.Statut.ToString());
            result.NomRole.Should().Be(employee.Role.NomRole);
        }



        // ============================================================
        // TEST 13
        // si l'employé n'existe pas → exception
        // ============================================================
        [Fact]
        public async Task GetByIdAsync_Should_Throw_ApiException_When_Employee_Not_Found()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // on simule que l'employé n'existe pas
            repoMock
                .Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Employe?)null);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // -------------------- Act --------------------
            Func<Task> act = async () => await service.GetByIdAsync(1);

            // -------------------- Assert --------------------
            await act.Should().ThrowAsync<ApiException>();
        }



        // ============================================================
        // TEST 14
        // GetAllAsync doit retourner la liste mappée des employés
        // ============================================================
        [Fact]
        public async Task GetAllAsync_Should_Return_Mapped_List_Of_Employees()
        {
            // -------------------- Arrange --------------------

            // création du mock repository
            var repoMock = new Mock<IEmployeeRepository>();

            // liste simulée des employés retournés par le repository
            var employees = new List<Employe>
            {
                new Employe
                {
                    IdEmploye = 1,
                    Nom = "Boutrik",
                    Prenom = "Aymane",
                    Email = "aymane@test.com",
                    Telephone = "0612345678",
                    IdRole = 1,
                    Statut = Service_Personnel.Enums.Employees.StatutEmploye.Actif,
                    Role = new Role
                    {
                        NomRole = "Manager"
                    }
                },
                new Employe
                {
                    IdEmploye = 2,
                    Nom = "El Amrani",
                    Prenom = "Sara",
                    Email = "sara@test.com",
                    Telephone = "0622222222",
                    IdRole = 2,
                    Statut = Service_Personnel.Enums.Employees.StatutEmploye.Inactif,
                    Role = new Role
                    {
                        NomRole = "RH"
                    }
                }
            };

            // on simule le retour du repository
            repoMock
                .Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(employees);

            // création du service
            var service = new EmployeeService(repoMock.Object);

            // -------------------- Act --------------------
            var result = await service.GetAllAsync();

            // -------------------- Assert --------------------
            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            result[0].Nom.Should().Be("Boutrik");
            result[0].Prenom.Should().Be("Aymane");
            result[0].Email.Should().Be("aymane@test.com");
            result[0].Statut.Should().Be("Actif");
            result[0].NomRole.Should().Be("Manager");

            result[1].Nom.Should().Be("El Amrani");
            result[1].Prenom.Should().Be("Sara");
            result[1].Email.Should().Be("sara@test.com");
            result[1].Statut.Should().Be("Inactif");
            result[1].NomRole.Should().Be("RH");
        }
    }
}