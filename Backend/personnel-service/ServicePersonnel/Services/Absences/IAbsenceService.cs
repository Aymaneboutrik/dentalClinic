using Service_Personnel.DTOS.Absence;
using Service_Personnel.Models;

namespace Service_Personnel.Services.Absences
{
    public interface IAbsenceService
    {
        Task<object> CreateAsync(CreateAbsenceRequestDto dto, CancellationToken ct = default);

        Task<List<AbsenceResponseDto>> GetAllAsync(CancellationToken ct = default);

        Task<List<AbsenceResponseDto>> GetByEmployeIdAsync(int employeId, CancellationToken ct = default);

        Task<object> DeleteAsync(int id, int docteurId, CancellationToken ct = default);
    }
}