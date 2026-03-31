using StockApi.Data;
using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Repositories.Implementations
{
    public class SortieRepository : ISortieRepository
    {
        private readonly AppDbContext _context;

        public SortieRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<Sortie> GetAll()
        {
            return _context.Sorties.ToList();
        }

        public void Add(Sortie sortie)
        {
            _context.Sorties.Add(sortie);
        }

        public Sortie? GetByProduitId(int produitId)
        {
            return _context.Sorties.FirstOrDefault(s => s.ProduitId == produitId);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}