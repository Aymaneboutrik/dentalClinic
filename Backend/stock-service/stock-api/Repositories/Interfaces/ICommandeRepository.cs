using StockApi.Models;

namespace StockApi.Repositories.Interfaces
{
    public interface ICommandeRepository
    {
        List<Commande> GetAll();
        Commande? GetById(int id);
        void Add(Commande commande);
        void Update(Commande commande);
        void Delete(Commande commande);
        void Save();
    }
}