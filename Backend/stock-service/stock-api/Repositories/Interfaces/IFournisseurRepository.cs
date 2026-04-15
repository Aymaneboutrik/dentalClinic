using StockApi.Models;

namespace StockApi.Repositories.Interfaces
{
    public interface IFournisseurRepository
    {
        List<Fournisseur> GetAll();
        Fournisseur? GetById(int id);
        void Add(Fournisseur fournisseur);
        void Update(Fournisseur fournisseur);
        void Delete(Fournisseur fournisseur);
        void Save();
    }
}