using StockApi.Models;

namespace StockApi.Repositories.Interfaces
{
    public interface ILigneCommandeRepository
    {
        List<LigneCommande> GetAll();
        void Add(LigneCommande ligne);
        LigneCommande? GetById(int id);
        void Update(LigneCommande ligne);
        void Delete(LigneCommande ligne);
        List<LigneCommande> GetByCommandeId(int commandeId);
        void Save();
    }
}
