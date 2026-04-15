using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Services
{
    public class MouvementStockService
    {
        private readonly IMouvementStockRepository _mouvementRepo;
        private readonly IProduitRepository _produitRepo;
        private readonly ISortieRepository _sortieRepo;

        public MouvementStockService(IMouvementStockRepository mouvementRepo,
                                     IProduitRepository produitRepo,
                                     ISortieRepository sortieRepo)
        {
            _mouvementRepo = mouvementRepo;
            _produitRepo = produitRepo;
            _sortieRepo = sortieRepo;
        }

        public List<MouvementStock> GetAll()
        {
            return _mouvementRepo.GetAll();
        }

        // Modification par l'assistant selon les règles
        public bool ModifierMouvement(int id, int? nouvelleQuantite = null, DateTime? nouvelleDate = null)
        {
            var mouv = _mouvementRepo.GetById(id);
            if (mouv == null) return false;

            switch (mouv.TypeMouvement)
            {
                case TypeMouvement.Sortie:
                    if (nouvelleQuantite.HasValue)
                    {
                        int diff = mouv.Quantite - nouvelleQuantite.Value;

                        // Mettre à jour mouvement
                        mouv.Quantite = nouvelleQuantite.Value;

                        // Mettre à jour sortie correspondante
                        var sortie = _sortieRepo.GetByProduitId(mouv.ProduitId!.Value);
                        if (sortie != null) sortie.Quantite = nouvelleQuantite.Value;

                        // Mettre à jour produit
                        var produit = _produitRepo.GetById(mouv.ProduitId!.Value);
                        if (produit != null) produit.Quantite -= diff;
                    }

                    if (nouvelleDate.HasValue)
                    {
                        mouv.DateMouvement = nouvelleDate.Value;

                        // Mettre à jour date dans sortie correspondante
                        var sortie = _sortieRepo.GetByProduitId(mouv.ProduitId!.Value);
                        if (sortie != null) sortie.DateSortie = nouvelleDate.Value;
                    }
                    break;

                case TypeMouvement.Entree:
                    if (nouvelleDate.HasValue)
                        mouv.DateMouvement = nouvelleDate.Value; // Seule modification autorisée
                    break;

                case TypeMouvement.Modifiee:
                    if (nouvelleDate.HasValue)
                        mouv.DateMouvement = nouvelleDate.Value;
                    // Impossible de modifier, date se met à jour automatiquement via CommandeValidation
                    break;
            }

            _mouvementRepo.Update(mouv);
            _mouvementRepo.Save();
            return true;
        }
    }
}