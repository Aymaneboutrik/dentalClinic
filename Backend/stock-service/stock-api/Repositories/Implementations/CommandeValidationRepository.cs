using Microsoft.EntityFrameworkCore;
using StockApi.Data;
using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Repositories.Implementations
{
    public class CommandeValidationRepository : ICommandeValidationRepository
    {
        private readonly AppDbContext _context;

        public CommandeValidationRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<CommandeValidation> GetAll()
        {
            return _context.Set<CommandeValidation>()
                .Include(cv => cv.Commande)
                .ToList();
        }

        public CommandeValidation? GetById(int id)
        {
            return _context.Set<CommandeValidation>()
                .Include(cv => cv.Commande)
                .FirstOrDefault(cv => cv.Id == id);
        }

        public CommandeValidation? GetByCommandeId(int commandeId)
        {
            return _context.Set<CommandeValidation>()
                .FirstOrDefault(cv => cv.CommandeId == commandeId);
        }

        public void Add(CommandeValidation validation)
        {
            _context.Set<CommandeValidation>().Add(validation);
        }

        public void Update(CommandeValidation validation)
        {
            _context.Set<CommandeValidation>().Update(validation);
        }

        public void Delete(CommandeValidation validation)
        {
            _context.Set<CommandeValidation>().Remove(validation);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
