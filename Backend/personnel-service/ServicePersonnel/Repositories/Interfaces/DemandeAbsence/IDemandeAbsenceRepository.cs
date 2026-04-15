using Service_Personnel.Models;

namespace Service_Personnel.Repositories.Interfaces.DemandesAbsence
{
    public interface IDemandeAbsenceRepository
    {
        Task AddAsync(DemandeAbsence demande, CancellationToken ct = default);
        // GETaLL
        Task<List<DemandeAbsence>> GetAllWithEmployeAsync(CancellationToken ct = default);

        //gETbYiD

        Task<DemandeAbsence?> GetByIdWithEmployeAsync(int id, CancellationToken ct = default);

        Task<List<DemandeAbsence>> GetByEmployeIdAsync(int employeId, CancellationToken ct = default);


        Task<DemandeAbsence?> GetByIdAsync(int id, CancellationToken ct = default);
        Task SaveChangesAsync(CancellationToken ct = default);


    }   
}