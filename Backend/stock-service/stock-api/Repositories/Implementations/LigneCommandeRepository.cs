using StockApi.Data;
using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Repositories.Implementations
{
    public class LigneCommandeRepository : ILigneCommandeRepository
    {
        private readonly AppDbContext _context;

        public LigneCommandeRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<LigneCommande> GetAll()
        {
            return _context.LignesCommandes.ToList();
        }

        public void Add(LigneCommande ligne)
        {
            _context.LignesCommandes.Add(ligne);
        }

        public LigneCommande? GetById(int id)
        {
            return _context.LignesCommandes
                .FirstOrDefault(l => l.Id == id);
        }

        public void Update(LigneCommande ligne)
        {
            _context.LignesCommandes.Update(ligne);
        }

        public void Delete(LigneCommande ligne)
        {
            _context.LignesCommandes.Remove(ligne);
        }

        public List<LigneCommande> GetByCommandeId(int commandeId)
        {
            return _context.LignesCommandes
                .Where(l => l.CommandeId == commandeId)
                .ToList();
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
