using Service_Personnel.DTOS.Employes;
using Service_Personnel.Models;


namespace Service_Personnel.Repositories.Interfaces.Employees
{
    public interface IEmployeeRepository
    {
        // Vérifie si un email existe déjà dans la base
        // retourne true = existe
        // retourne false = n'existe pas
        // async = opération base de données
        // CancellationToken = permet d'annuler la requête si besoin
        Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);


        // Plusieurs employés peuvent avoir le même rôle
        // MAIS le rôle doit exister dans la table Role
        // Vérifie si le roleId existe dans la table Role
        // true = role valide
        // false = role inexistant
        Task<bool> RoleExistsAsync(int roleId, CancellationToken ct = default);


        // Ajoute un employé dans le DbContext
        // IMPORTANT : ça n’insère pas encore dans la base
        // ça fait juste : context.Add(...)
        Task AddAsync(Employe employee, CancellationToken ct = default);




        // Exécute réellement les requêtes SQL (INSERT / UPDATE / DELETE)
        // retourne le nombre de lignes affectées
        Task<int> SaveChangesAsync(CancellationToken ct = default);


        ///


        Task<string?> GetRoleNameAsync(int roleId, CancellationToken ct = default);
        /// GetById   
        Task<Employe?> GetByIdAsync(int id, CancellationToken ct = default);

        Task UpdateAsync(Employe employee, CancellationToken ct = default);


        /// Get employer 

        Task<List<Employe>> GetAllAsync(CancellationToken ct = default);


        ///Delet employee
        ///
        Task DeleteAsync(Employe employee, CancellationToken ct = default);

        Task<Employe?> GetByIdWithRoleAsync(int id, CancellationToken ct = default);




    }
}
