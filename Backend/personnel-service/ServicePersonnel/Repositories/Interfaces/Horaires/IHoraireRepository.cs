using Service_Personnel.Enums.Horaires;
using Service_Personnel.Models;

namespace Service_Personnel.Repositories.Interfaces.Horaires
{
    public interface IHoraireRepository
    {
        // Ajouter un nouvel horaire en base
        Task<Horaire> AddAsync(Horaire horaire);

        // getById

        Task<Horaire?> GetByIdAsync(int id);

        Task SaveChangesAsync();

        // verification si l employer  a deux horaire  dans le meme  temps dans le planing ? 
        Task<bool> ExistsOverlapAsync(int employeId, JourSemaine jour, TimeOnly debut, TimeOnly fin, int? excludeId = null, CancellationToken ct = default);


        Task<Horaire?> GetByIdWithEmployeAsync(int id, CancellationToken ct = default);


        //GEt 
        Task<List<Horaire>> GetAllWithEmployeAsync(CancellationToken ct = default);

        //Delet 

        void Delete(Horaire horaire);



    }
}