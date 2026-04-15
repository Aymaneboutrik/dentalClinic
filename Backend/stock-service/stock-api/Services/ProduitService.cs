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

            // ⚠️ Le mouvement stock est créé dans LigneCommandeController
            // avec le bon CommandeId — ne pas le créer ici

            return nouveauProduit;
        }

        public List<Produit> GetAllProduits()
        {
            return _produitRepository.GetAll();
        }
    }
}
