using Microsoft.EntityFrameworkCore;
using StockApi.Data;
using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Repositories.Implementations
{
    public class CommandeRepository : ICommandeRepository
    {
        private readonly AppDbContext _context;

        public CommandeRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<Commande> GetAll()
        {
            return _context.Commandes
                .Include(c => c.Lignes)
                .ToList();
        }

        public Commande? GetById(int id)
        {
            return _context.Commandes.Find(id);
        }

        public void Add(Commande commande)
        {
            _context.Commandes.Add(commande);
        }

        public void Update(Commande commande)
        {
            _context.Commandes.Update(commande);
        }

        public void Delete(Commande commande)
        {
            _context.Commandes.Remove(commande);
        }

        public void Save()
        {
            _context.SaveChanges();
        }
    }
}