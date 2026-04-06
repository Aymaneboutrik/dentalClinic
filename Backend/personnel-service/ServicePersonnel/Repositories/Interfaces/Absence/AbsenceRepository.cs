using Microsoft.EntityFrameworkCore;
using Service_Personnel.Data;
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.Absences;

namespace Service_Personnel.Repositories.Absences
{
    public class AbsenceRepository : IAbsenceRepository
    {
        private readonly AppDbContext _context;

        public AbsenceRepository(AppDbContext context)
        {
            _context = context; //ingection de depondance 
        }

        public async Task AddAsync(Absence absence, CancellationToken ct = default)
        {
            await _context.Absences.AddAsync(absence, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<List<Absence>> GetAllWithEmployeAsync(CancellationToken ct = default)
        {
            return await _context.Absences
                .Include(a => a.Employe)
                .ToListAsync(ct);
        }

        public async Task<List<Absence>> GetByEmployeIdAsync(int employeId, CancellationToken ct = default)
        {
            return await _context.Absences
                .Include(a => a.Employe)
                .Where(a => a.EmployeId == employeId)
                .ToListAsync(ct);
        }


        public async Task<Absence?> GetByIdAsync(int id, CancellationToken ct = default)
        {
            return await _context.Absences
                .FirstOrDefaultAsync(a => a.IdAbsence == id, ct);
        }

        public void Delete(Absence absence)
        {
            _context.Absences.Remove(absence);
        }

        public async Task SaveChangesAsync(CancellationToken ct = default)
        {
            await _context.SaveChangesAsync(ct);
        }
    }
}