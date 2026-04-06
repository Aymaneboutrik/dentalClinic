using StockApi.Data;
using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Repositories.Implementations
{
    public class MouvementStockRepository : IMouvementStockRepository
    {
        private readonly AppDbContext _context;

        public MouvementStockRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<MouvementStock> GetAll() => _context.MouvementsStock.ToList();

        public MouvementStock? GetById(int id) => _context.MouvementsStock.Find(id);

        public void Add(MouvementStock mouvement) => _context.MouvementsStock.Add(mouvement);

        public void Update(MouvementStock mouvement) => _context.MouvementsStock.Update(mouvement);

        public void Delete(MouvementStock mouvement) => _context.MouvementsStock.Remove(mouvement);

        public void Save() => _context.SaveChanges();
    }
}