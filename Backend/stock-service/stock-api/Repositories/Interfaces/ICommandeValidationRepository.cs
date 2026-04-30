using StockApi.Models;

namespace StockApi.Repositories.Interfaces
{
    public interface ICommandeValidationRepository
    {
        List<CommandeValidation> GetAll();
        CommandeValidation? GetById(int id);
        CommandeValidation? GetByCommandeId(int commandeId);
        void Add(CommandeValidation validation);
        void Update(CommandeValidation validation);
        void Delete(CommandeValidation validation);
        void Save();
    }
}
