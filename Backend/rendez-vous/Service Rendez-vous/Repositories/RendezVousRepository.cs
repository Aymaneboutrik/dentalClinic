using Microsoft.EntityFrameworkCore;
using Service_Rendez_vous.Data;
using Service_Rendez_vous.Models;
using Service_Rendez_vous.Repositories.Interfaces;

namespace Service_Rendez_vous.Repositories
{
    public class RendezVousRepository : IRendezVousRepository
    {
        private readonly AppDbContext _context;

        public RendezVousRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RendezVous>> GetAllAsync()
        {
            return await _context.RendezVous.ToListAsync();
        }

        public async Task<RendezVous?> GetByIdAsync(int id)
        {
            return await _context.RendezVous.FindAsync(id);
        }

        public async Task<RendezVous> AddAsync(RendezVous rdv)
        {
            await _context.RendezVous.AddAsync(rdv);
            await _context.SaveChangesAsync();
            return rdv;
        }

        public async Task UpdateAsync(RendezVous rdv)
        {
            _context.RendezVous.Update(rdv);
            await _context.SaveChangesAsync();
        }

        public async Task AddHistoriqueAsync(HistoriqueRDV historique)
        {
            await _context.HistoriqueRDV.AddAsync(historique);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<HistoriqueRDV>> GetHistoryByRendezVousIdAsync(int rdvId)
        {
            return await _context.HistoriqueRDV
                .Where(h => h.RendezVousId == rdvId)
                .OrderByDescending(h => h.DateModification)
                .ToListAsync();
        }

        public async Task<IEnumerable<HistoriqueRDV>> GetAllHistoryAsync()
        {
            return await _context.HistoriqueRDV
                .OrderByDescending(h => h.DateModification)
                .ToListAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var rdv = await _context.RendezVous.FindAsync(id);
            if (rdv != null)
            {
                _context.RendezVous.Remove(rdv);
                await _context.SaveChangesAsync();
            }
        }
    }
}
