using StockApi.Data;
using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Repositories.Implementations
{
    public class FournisseurRepository : IFournisseurRepository
    {
        private readonly AppDbContext _context;

        public FournisseurRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<Fournisseur> GetAll()
        {
            return _context.Fournisseurs.ToList();
        }

        public Fournisseur? GetById(int id)
        {
            return _context.Fournisseurs.Find(id);
        }

        public void Add(Fournisseur fournisseur)
        {
            _context.Fournisseurs.Add(fournisseur);
        }

        public void Update(Fournisseur fournisseur)
        {
            _context.Fournisseurs.Update(fournisseur);
        }

        public void Delete(Fournisseur fournisseur)
        {
            _context.Fournisseurs.Remove(fournisseur);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}