using StockApi.Models;
using StockApi.Repositories.Interfaces;
using StockApi.Enums;
using StockApi.Exceptions;

namespace StockApi.Services
{
    public class MouvementStockService
    {
        private readonly IMouvementStockRepository _mouvementStockRepository;
        private readonly IProduitRepository _produitRepository;

        public MouvementStockService(
            IMouvementStockRepository mouvementStockRepository,
            IProduitRepository produitRepository)
        {
            _mouvementStockRepository = mouvementStockRepository;
            _produitRepository = produitRepository;
        }

        public void CreateEntreeMouvement(LigneCommande ligne)
        {
            var mouvement = new MouvementStock
            {
                TypeMouvement = TypeMouvement.Entree,
                Quantite = ligne.Quantite,
                DateMouvement = DateTime.UtcNow,
                ProduitId = ligne.ProduitId,
                LigneCommandeId = ligne.Id
            };

            _mouvementStockRepository.Add(mouvement);

            var produit = _produitRepository.GetById(ligne.ProduitId);
            if (produit != null)
            {
                produit.Quantite += ligne.Quantite;
                _produitRepository.Update(produit);
            }
        }

        public void CreateSortieMouvement(int produitId, int quantite, int? ligneCommandeId = null)
        {
            var produit = _produitRepository.GetById(produitId);
            if (produit == null) throw new NotFoundException("Produit introuvable.");

            if (!produit.Actif) throw new ProduitInactifException("Impossible de faire une sortie sur un produit inactif.");
            if (quantite <= 0) throw new InvalidQuantityException("La quantité de sortie doit être strictement positive.");
            if (produit.Quantite < quantite) throw new InsufficientStockException("Stock insuffisant.");

            var mouvement = new MouvementStock
            {
                TypeMouvement = TypeMouvement.Sortie,
                Quantite = quantite,
                DateMouvement = DateTime.UtcNow,
                ProduitId = produitId,
                LigneCommandeId = ligneCommandeId
            };

            _mouvementStockRepository.Add(mouvement);

            produit.Quantite -= quantite;
            _produitRepository.Update(produit);
        }
    }
}