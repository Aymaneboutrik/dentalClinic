using StockApi.Models;
using System.Collections.Generic;

namespace StockApi.Repositories.Interfaces
{
    public interface ISortieRepository
    {
        // Récupérer toutes les sorties
        List<Sortie> GetAll();

        // Ajouter une sortie
        void Add(Sortie sortie);

        Sortie? GetByProduitId(int produitId);
        // Sauvegarder les changements
        void Save();
    }
}