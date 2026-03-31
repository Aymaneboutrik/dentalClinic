using StockApi.Models;

namespace StockApi.Repositories.Interfaces
{
    public interface IProduitRepository
    {
        List<Produit> GetAll();
        void Add(Produit produit);
        Produit? GetByName(string nom);
        void Update(Produit produit);
        Produit? GetById(int id);
        void Delete(Produit produit);
        void Save();
    }
}