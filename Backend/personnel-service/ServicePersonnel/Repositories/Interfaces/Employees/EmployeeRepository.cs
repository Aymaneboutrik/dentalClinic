using Microsoft.EntityFrameworkCore;
using Service_Personnel.Data; //import databasse  pour utilioser AppDbContext 
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.Employees;

namespace Service_Personnel.Repositories.Interfaces.Employees
{
    public class EmployeeRepository : IEmployeeRepository // la classe implement l interface IEmployeeRepository
    {
        private readonly AppDbContext _context; // variable priver qui contient la connection avec la base de donnes 

        public EmployeeRepository(AppDbContext context)
        {
            // Constructeur → injection du DbContext (Dependency Injection)!!!!!!!!

            _context = context;
        }

        public async Task<bool> EmailExistsAsync(string email, CancellationToken ct = default)
        {
            // Vérifie si un email existe déjà
            // SQL généré : SELECT EXISTS(...)
            // true = existe déjà
            // false = libre


            return await _context.Employes
                .AnyAsync(e => e.Email == email, ct);
        }

        public async Task<bool> RoleExistsAsync(int roleId, CancellationToken ct = default)
        {
            // Vérifie si un rôle existe dans la table Role
            // utile pour valider FK avant insertion

            return await _context.Roles
                .AnyAsync(r => r.IdRole == roleId, ct);
        }

        public async Task AddAsync(Employe employee, CancellationToken ct = default)
        {
            // Ajoute l’employé au DbContext

            await _context.Employes.AddAsync(employee, ct);
        }

        public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            // Exécute réellement les requêtes SQL
            // INSERT / UPDATE / DELETE
            // retourne le nombre de lignes modifiées

            return await _context.SaveChangesAsync(ct);
        }
        ///
        public async Task<string?> GetRoleNameAsync(int roleId, CancellationToken ct = default)
        {
            return await _context.Roles
                .Where(r => r.IdRole == roleId)
                .Select(r => r.NomRole)
                .FirstOrDefaultAsync(ct);
        }

        /// Update d'un employé//////////////////////////////////////////
        /// 
        public async Task<Employe?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            return await _context.Employes
                        .Include(e => e.Role) // pour recupere le role de l employer aussi 

                .FirstOrDefaultAsync(e => e.IdEmploye == id, ct);
        }

        public async Task UpdateAsync(Employe employee, CancellationToken ct = default)
        {
            _context.Employes.Update(employee);
            await _context.SaveChangesAsync(ct);
        }

        ////////////////////////////get employe ////////////////////////////

        public async Task<List<Employe>> GetAllAsync(CancellationToken ct = default)
        {
            // Récupère tous les employés depuis la base
            // Include(Role) est nécessaire pour charger le rôle lié à chaque employé
            // sinon NomRole ne sera pas disponible dans le mapping

            return await _context.Employes
                .Include(e => e.Role)
                .OrderBy(e => e.IdEmploye) // pour  recupere les employer par order 
                .ToListAsync(ct);
        }


        //Delet Employe 

        public async Task DeleteAsync(Employe employee, CancellationToken ct = default)
        {
            // Marque l'employé comme supprimé dans le contexte EF Core
            _context.Employes.Remove(employee);

            // Enregistre la suppression dans la base de données
            await _context.SaveChangesAsync(ct);
        }


        public async Task<Employe?> GetByIdWithRoleAsync(int id, CancellationToken ct = default)
        {
            return await _context.Employes
                .Include(e => e.Role)
                .FirstOrDefaultAsync(e => e.IdEmploye == id, ct);
        }




    }

}