using StockApi.Models;
using StockApi.Repositories.Interfaces;
using StockApi.Enums;
using StockApi.DTOs;

namespace StockApi.Services
{
    public class ProduitService
    {
        private readonly IProduitRepository _produitRepository;
        private readonly IMouvementStockRepository _mouvementRepository;

        public ProduitService(
            IProduitRepository produitRepository,
            IMouvementStockRepository mouvementRepository)
        {
            _produitRepository = produitRepository;
            _mouvementRepository = mouvementRepository;
        }

        public virtual Produit CreerDepuisLigneCommande(LigneCommande ligne, ProduitDto produitDto)
        {
            var nouveauProduit = new Produit
            {
                Nom = ligne.Nom,
                Quantite = ligne.Quantite,
                Description = produitDto?.Description ?? "",
                SeuilAlerte = produitDto?.SeuilAlerte ?? 0,
                DatePeremption = produitDto?.DatePeremption ?? DateTime.Now
            };

            _produitRepository.Add(nouveauProduit);
            _produitRepository.Save();

            // 🔥 création mouvement stock automatique
            var mouvementEntree = new MouvementStock
            {
                TypeMouvement = TypeMouvement.Entree,
                Quantite = nouveauProduit.Quantite,
                DateMouvement = null,
                ProduitId = nouveauProduit.Id
            };

            _mouvementRepository.Add(mouvementEntree);
            _mouvementRepository.Save();

            return nouveauProduit;
        }

        public List<Produit> GetAllProduits()
        {
            return _produitRepository.GetAll();
        }
    }
}