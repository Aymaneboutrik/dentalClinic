using Microsoft.EntityFrameworkCore;
using Service_Personnel.Data;
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.DemandesAbsence;

namespace Service_Personnel.Repositories.DemandesAbsence
{
    public class DemandeAbsenceRepository : IDemandeAbsenceRepository
    {
        private readonly AppDbContext _context;

        public DemandeAbsenceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(DemandeAbsence demande, CancellationToken ct = default)
        {
            await _context.DemandeAbsences.AddAsync(demande, ct);
            await _context.SaveChangesAsync(ct);
        }

        //GetAll DemandesAbsence
        public async Task<List<DemandeAbsence>> GetAllWithEmployeAsync(CancellationToken ct = default)
        {
            return await _context.DemandeAbsences
                .Include(d => d.Employe)
                .ToListAsync(ct);
        }

        //gETbYiD

        public async Task<DemandeAbsence?> GetByIdWithEmployeAsync(int id, CancellationToken ct = default)
        {
            return await _context.DemandeAbsences
                .Include(d => d.Employe)
                .FirstOrDefaultAsync(d => d.IdDemande == id, ct);
        }


        public async Task<DemandeAbsence?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            return await _context.DemandeAbsences
                .FirstOrDefaultAsync(d => d.IdDemande == id, ct);
        }

        public async Task SaveChangesAsync(CancellationToken ct = default)
        {
            await _context.SaveChangesAsync(ct);
        }


        public async Task<List<DemandeAbsence>> GetByEmployeIdAsync(int employeId, CancellationToken ct = default)
        {
            return await _context.DemandeAbsences
                .Include(d => d.Employe)
                .Where(d => d.EmployeId == employeId)
                .ToListAsync(ct);
        }
    }
}