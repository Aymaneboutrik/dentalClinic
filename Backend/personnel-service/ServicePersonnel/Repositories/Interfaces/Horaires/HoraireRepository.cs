using Microsoft.EntityFrameworkCore;
using Service_Personnel.Data;
using Service_Personnel.Enums.Horaires;
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.Horaires;

namespace Service_Personnel.Repositories.Horaires
{
    public class HoraireRepository : IHoraireRepository
    {
        private readonly AppDbContext _context;


        public HoraireRepository(AppDbContext context)
        {
            _context = context;  //  Injection du DbContext dans le constructeur
        }

        public async Task<Horaire> AddAsync(Horaire horaire)
        {
            //  Ajout en base
            await _context.Horaires.AddAsync(horaire);

            //  Sauvegarde
            await _context.SaveChangesAsync();

            //  Retourne l'entité créée (avec Id généré)
            return horaire;
        }


        //// getById
        public async Task<Horaire?> GetByIdAsync(int id)
        {
            return await _context.Horaires
                .FirstOrDefaultAsync(h => h.IdHoraire == id);
        }

       
        ///

        public async Task<bool> ExistsOverlapAsync(int employeId, JourSemaine jour, TimeOnly debut, TimeOnly fin, int? excludeId = null, CancellationToken ct = default)
        {
            return await _context.Horaires
                .AnyAsync(h =>
                    h.IdEmploye == employeId &&
                    h.Jour == jour &&
                    (excludeId == null || h.IdHoraire != excludeId) &&
                    debut < h.HeureFin &&
                    fin > h.HeureDebut,
                    ct
                );
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        ////////////////////////////////
        ///
        public async Task<Horaire?> GetByIdWithEmployeAsync(int id, CancellationToken ct = default)
        {
            return await _context.Horaires
                .Include(h => h.Employe)
                .ThenInclude(e => e.Role)
                .FirstOrDefaultAsync(h => h.IdHoraire == id, ct);
        }

        // Get 

        public async Task<List<Horaire>> GetAllWithEmployeAsync(CancellationToken ct = default)
        {
            return await _context.Horaires
                .Include(h => h.Employe)
                .ThenInclude(e => e.Role)
                 .OrderBy(h => h.IdHoraire) // Pour me donner la  liste  par order  orderBy
                .ToListAsync(ct);
        }

        //Delete

        public void Delete(Horaire horaire)
        {
            _context.Horaires.Remove(horaire);
        }
    }



}