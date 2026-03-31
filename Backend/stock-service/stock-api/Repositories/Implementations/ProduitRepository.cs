using StockApi.Data;
using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Repositories.Implementations
{
    public class ProduitRepository : IProduitRepository
    {
        private readonly AppDbContext _context;

        public ProduitRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<Produit> GetAll()
        {
            return _context.Produits.ToList();
        }

        public void Add(Produit produit)
        {
            _context.Produits.Add(produit);
        }

        public Produit? GetByName(string nom)
        {
            return _context.Produits.FirstOrDefault(p => p.Nom == nom);
        }

        public void Update(Produit produit)
        {
            _context.Produits.Update(produit);
        }

        public Produit? GetById(int id)
        {
            return _context.Produits.Find(id);
        }

        public void Delete(Produit produit)
        {
            _context.Produits.Remove(produit);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}