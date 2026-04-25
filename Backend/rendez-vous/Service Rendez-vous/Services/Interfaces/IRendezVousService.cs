using System.Collections.Generic;
using System.Threading.Tasks;
using Service_Rendez_vous.DTOs;

namespace Service_Rendez_vous.Services.Interfaces
{
    public interface IRendezVousService
    {
        Task<IEnumerable<RendezVousDto>> GetAllAsync();
        Task<RendezVousDto> GetByIdAsync(int id);
        Task<RendezVousDto> CreateAsync(CreateRendezVousDto dto);
        Task<RendezVousDto> UpdateAsync(int id, UpdateRendezVousDto dto);
        Task CancelAsync(int id, string modifiePar);
        Task MarkAsAbsentAsync(int id, int modifiePar);
        Task RescheduleAsync(int id, RescheduleRendezVousDto dto);
        Task ConfirmAsync(int id, int modifiePar);
        Task MarkAsCompletedAsync(int id, int modifiePar);
        Task<IEnumerable<HistoriqueRDVDto>> GetHistoryAsync(int id);
        Task<IEnumerable<HistoriqueRDVDto>> GetAllHistoryAsync();
    }
}
