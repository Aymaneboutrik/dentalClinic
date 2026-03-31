using FluentAssertions;
using Service_Personnel.DTOS.Employes;
using Service_Personnel.Enums.Employees;
using Service_Personnel.Mappers.Employees;
using Service_Personnel.Models;
using Xunit;

namespace xUnit_Test_Project.MappersTests.Employee
{
    public class EmployeeMapperTests
    {
        [Fact]
        public void ToEntity_Should_Map_CreateEmployeeRequestDto_To_Employe()
        {
            // Arrange
            var dto = new CreateEmployeeRequestDto
            {
                // Ici on crée l’objet DTO qui sera donné au mapper.

                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1
            };

            // Act
            var result = EmployeeMapper.ToEntity(dto);

            // Assert
            result.Should().NotBeNull(); // on vérifie si le résultat du mapper existe
            result.Nom.Should().Be(dto.Nom);
            result.Prenom.Should().Be(dto.Prenom);
            result.Email.Should().Be(dto.Email);
            result.Telephone.Should().Be(dto.Telephone);
            result.IdRole.Should().Be(dto.IdRole);
        }

        [Fact]
        public void MapUpdate_Should_Update_All_Fields_When_Dto_Contains_Values()
        {
            // Arrange
            var employee = new Employe
            {
                // Ici on crée un employé existant que le mapper va modifier.

                Nom = "AncienNom",
                Prenom = "AncienPrenom",
                Email = "ancien@test.com",
                Telephone = "0600000000",
                IdRole = 1,
                Statut = StatutEmploye.Actif
            };

            var dto = new UpdateEmployeeRequestDto
            {
                // Ici on prépare de nouvelles valeurs à appliquer.

                Nom = "NouveauNom",
                Prenom = "NouveauPrenom",
                Email = "nouveau@test.com",
                Telephone = "0611111111",
                IdRole = 2,
                Statut = StatutEmploye.Inactif
            };

            // Act
            EmployeeMapper.MapUpdate(employee, dto);

            // Assert
            employee.Nom.Should().Be(dto.Nom);
            employee.Prenom.Should().Be(dto.Prenom);
            employee.Email.Should().Be(dto.Email);
            employee.Telephone.Should().Be(dto.Telephone);
            employee.IdRole.Should().Be(dto.IdRole!.Value);
            employee.Statut.Should().Be(dto.Statut!.Value);
        }

        [Fact]
        public void MapUpdate_Should_Not_Update_String_Fields_When_Dto_Contains_Null_Or_WhiteSpace()
        {
            // Arrange
            var employee = new Employe
            {
                // Ici on prépare un employé avec des anciennes valeurs.
                // Ces valeurs ne doivent pas changer si le DTO contient null, vide ou espaces.

                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1,
                Statut = StatutEmploye.Actif
            };

            var dto = new UpdateEmployeeRequestDto
            {
                // Le mapper ne doit pas remplacer les anciennes valeurs
                // avec null, chaine vide ou espaces.

                Nom = null,
                Prenom = "",
                Email = "   ",
                Telephone = null
            };

            // Act
            EmployeeMapper.MapUpdate(employee, dto);

            // Assert
            employee.Nom.Should().Be("Boutrik");
            employee.Prenom.Should().Be("Aymane");
            employee.Email.Should().Be("aymane@test.com");
            employee.Telephone.Should().Be("0612345678");
        }

        [Fact]
        public void MapUpdate_Should_Not_Update_IdRole_And_Statut_When_Dto_Values_Are_Null()
        {
            // Arrange
            var employee = new Employe
            {
                // Ici on prépare un employé avec des valeurs déjà existantes.
                // Si le DTO n’envoie rien pour IdRole et Statut,
                // ces valeurs doivent rester inchangées.

                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                IdRole = 1,
                Statut = StatutEmploye.Actif
            };

            var dto = new UpdateEmployeeRequestDto
            {
                IdRole = null,
                Statut = null
            };

            // Act
            EmployeeMapper.MapUpdate(employee, dto);

            // Assert
            employee.IdRole.Should().Be(1);
            employee.Statut.Should().Be(StatutEmploye.Actif);
        }

        [Fact]
        public void ToResponseDto_Should_Map_Employe_To_EmployeeResponseDto()
        {
            // Arrange
            var employee = new Employe
            {
                // Ici on crée un employé complet.
                // On doit aussi remplir Role, car le mapper utilise employee.Role.NomRole.

                IdEmploye = 10,
                Nom = "Boutrik",
                Prenom = "Aymane",
                Email = "aymane@test.com",
                Telephone = "0612345678",
                Statut = StatutEmploye.Actif,
                IdRole = 1,
                Role = new Role
                {
                    NomRole = "Manager"
                }
            };

            // Act
            var result = EmployeeMapper.ToResponseDto(employee);

            // Assert
            result.Should().NotBeNull(); // on vérifie que le DTO de réponse est bien créé
            result.IdEmploye.Should().Be(employee.IdEmploye);
            result.Nom.Should().Be(employee.Nom);
            result.Prenom.Should().Be(employee.Prenom);
            result.Email.Should().Be(employee.Email);
            result.Telephone.Should().Be(employee.Telephone);
            result.Statut.Should().Be(employee.Statut.ToString());
            result.NomRole.Should().Be(employee.Role.NomRole);
        }
    }
}