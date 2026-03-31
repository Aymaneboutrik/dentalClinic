using StockApi.Models;

namespace StockApi.Repositories.Interfaces
{
    public interface IMouvementStockRepository
    {
        List<MouvementStock> GetAll();
        MouvementStock? GetById(int id);
        void Add(MouvementStock mouvement);
        void Update(MouvementStock mouvement);
        void Delete(MouvementStock mouvement);
        void Save();
    }
}