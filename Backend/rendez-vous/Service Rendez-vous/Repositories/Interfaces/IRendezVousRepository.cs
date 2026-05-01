using System.Collections.Generic;
using System.Threading.Tasks;
using Service_Rendez_vous.Models;

namespace Service_Rendez_vous.Repositories.Interfaces
{
    public interface IRendezVousRepository
    {
        Task<IEnumerable<RendezVous>> GetAllAsync();
        Task<RendezVous?> GetByIdAsync(int id);
        Task<RendezVous> AddAsync(RendezVous rdv);
        Task UpdateAsync(RendezVous rdv);
        Task AddHistoriqueAsync(HistoriqueRDV historique);
        Task<IEnumerable<HistoriqueRDV>> GetHistoryByRendezVousIdAsync(int rdvId);
        Task<IEnumerable<HistoriqueRDV>> GetAllHistoryAsync();
        Task DeleteAsync(int id);
    }
}
