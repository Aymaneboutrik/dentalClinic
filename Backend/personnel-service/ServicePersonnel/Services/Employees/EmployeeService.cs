using Service_Personnel.DTOS.Employes;
using Service_Personnel.Exceptions;
using Service_Personnel.Mappers.Employees;
using Service_Personnel.Repositories.Interfaces.Employees;
using System.Runtime.ConstrainedExecution;
using Service_Personnel.Enums.Employees;

namespace Service_Personnel.Services.Employees
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repo;

        public EmployeeService(IEmployeeRepository repo)
        {
            _repo = repo; // constructeur avec injection de dépendance (DI) pour accéder au repository
        }
        public async Task<object> CreateAsync(CreateEmployeeRequestDto dto, CancellationToken ct = default)
        {
            // 1 — Vérifier email unique
            if (await _repo.EmailExistsAsync(dto.Email, ct))
                throw new ApiException("Email déjà utilisé", 409, "EMAIL_EXISTS");

            // 2 — Vérifier rôle existe
            if (!await _repo.RoleExistsAsync(dto.IdRole, ct))
                throw new ApiException("Rôle inexistant", 400, "ROLE_NOT_FOUND"); // hna en créer un objet ApiException.

            // 3 — Mapping DTO → Entity
            var employee = EmployeeMapper.ToEntity(dto);


            // 4 — Statut par défaut
            employee.Statut = StatutEmploye.Actif;

            // 5 — Ajout en base
            await _repo.AddAsync(employee, ct); // AddAsync SaveChangesAsync : ce sont des méthodes fournies par entity framework
                                                // pour ajouter une entité à la base de données et sauvegarder les changements
            await _repo.SaveChangesAsync(ct);

            // 6 — Retourner l'id généré
            var roleName = await _repo.GetRoleNameAsync(employee.IdRole, ct);

            return new
            {
                employee.Nom,
                employee.Prenom,
                Role = roleName
            };
        }
        //Update d'un employé

        public async Task<object> UpdateAsync(int id, UpdateEmployeeRequestDto dto, CancellationToken ct = default)
        {
            // 1. Récupérer l’employé
            var employee = await _repo.GetByIdAsync(id, ct);

            // 2. Vérifier s’il existe
            if (employee == null)
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

            // 3. Vérifier le rôle seulement s’il est envoyé et différent
            if (dto.IdRole.HasValue && employee.IdRole != dto.IdRole.Value)
            {
                if (!await _repo.RoleExistsAsync(dto.IdRole.Value, ct))
                    throw new ApiException("Rôle inexistant", 400, "ROLE_NOT_FOUND");
            }

            // 4. Vérifier l’email seulement s’il est envoyé, non vide et différent
            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                !string.Equals(employee.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
            {
                if (await _repo.EmailExistsAsync(dto.Email, ct))
                    throw new ApiException("Email déjà utilisé", 409, "EMAIL_ALREADY_EXISTS");
            }

            // 5. Appliquer seulement les champs envoyés
            EmployeeMapper.MapUpdate(employee, dto);

            // 6. Sauvegarder
            await _repo.UpdateAsync(employee, ct);

            // 7. Retour
            return new
            {
                Message = "Employé modifié avec succès"
            };
        }

        //Get 

        public async Task<List<EmployeeResponseDto>> GetAllAsync(CancellationToken ct = default)
        {
            var employees = await _repo.GetAllAsync(ct);

            return employees
                .Select(EmployeeMapper.ToResponseDto)
                .ToList();
        }

        //GetById 

        public async Task<EmployeeResponseDto> GetByIdAsync(int id, CancellationToken ct = default)
        {
            // 1. Récupérer l'employé depuis le repository
            var employee = await _repo.GetByIdAsync(id, ct);

            // 2. Vérifier s'il existe
            if (employee == null)
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

            // 3. Mapper l'entité vers DTO de réponse
            return EmployeeMapper.ToResponseDto(employee);
        }

        //Delet Employe 
        public async Task DeleteAsync(int id, CancellationToken ct = default)
        {
            // Récupérer l'employé existant depuis le repository
            var employee = await _repo.GetByIdAsync(id, ct);

            // Vérification métier : si l'employé n'existe pas, on lève une exception
            if (employee == null)
            {
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");
            }

            // Si l'employé existe, on appelle le repository pour le supprimer
            await _repo.DeleteAsync(employee, ct);
        }
    }
}
