using Service_Personnel.Models;

namespace Service_Personnel.Repositories.Interfaces.Absences
{
    public interface IAbsenceRepository
    {
        Task AddAsync(Absence absence, CancellationToken ct = default);
        Task<List<Absence>> GetAllWithEmployeAsync(CancellationToken ct = default);
        Task<List<Absence>> GetByEmployeIdAsync(int employeId, CancellationToken ct = default);
        Task<Absence?> GetByIdAsync(int id, CancellationToken ct = default);
        void Delete(Absence absence);
        Task SaveChangesAsync(CancellationToken ct = default);


    }



}