using Service_Personnel.DTOS;
using Service_Personnel.DTOS.DemandeAbsence;

namespace Service_Personnel.Services.Interfaces.DemandeAbsence
{
    public interface IDemandeAbsenceService
    {
        Task<object> CreateAsync(CreateDemandeAbsenceDto dto, int employeId, CancellationToken ct = default);


        //GetAll 
        Task<List<DemandeAbsenceResponseDto>> GetAllAsync(CancellationToken ct = default);

        //gETBYID

        Task<List<DemandeAbsenceResponseDto>> GetByEmployeIdAsync(int employeId, CancellationToken ct = default);
        //////////////////////////////////////////////////

        Task<object> AccepterAsync(int demandeId, int traiteParId, CancellationToken ct = default);
        Task<object> RefuserAsync(int demandeId, int traiteParId, CancellationToken ct = default);

    }
}