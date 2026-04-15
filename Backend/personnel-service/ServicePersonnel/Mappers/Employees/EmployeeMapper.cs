// Mappers/Employees/EmployeeMapper.cs
using Service_Personnel.DTOS.Employes;
using Service_Personnel.Models;

namespace Service_Personnel.Mappers.Employees
{
    public static class EmployeeMapper
    {
        public static Employe ToEntity(CreateEmployeeRequestDto dto)
        {
            return new Employe

            {
                Nom = dto.Nom,
                Prenom = dto.Prenom,
                Email = dto.Email,
                Telephone = dto.Telephone,
                IdRole = dto.IdRole

                // Statut = pas ici (règle métier)
            };


        }           //Employe existant → Mapper → Employe modifié
                    // Employe existant -> mapper seulement les champs envoyés
        public static void MapUpdate(Employe employee, UpdateEmployeeRequestDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.Nom))
                employee.Nom = dto.Nom;

            if (!string.IsNullOrWhiteSpace(dto.Prenom))
                employee.Prenom = dto.Prenom;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                employee.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.Telephone))
                employee.Telephone = dto.Telephone;

            if (dto.IdRole.HasValue)
                employee.IdRole = dto.IdRole.Value;

            if (dto.Statut.HasValue)
                employee.Statut = dto.Statut.Value;
        }

        // get
        public static EmployeeResponseDto ToResponseDto(Employe employee)
        {
            return new EmployeeResponseDto
            {
                IdEmploye = employee.IdEmploye,
                Nom = employee.Nom,
                Prenom = employee.Prenom,
                Email = employee.Email,
                Telephone = employee.Telephone,
                Statut = employee.Statut.ToString(), // pour afficher le non de status pas  le nombre depuis l ennum...
                NomRole = employee.Role.NomRole
            };
        }



    }
}