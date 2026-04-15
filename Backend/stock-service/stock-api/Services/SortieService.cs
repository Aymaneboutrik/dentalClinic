using StockApi.Models;
using StockApi.Repositories.Interfaces;
using StockApi.Enums;

namespace StockApi.Services
{
    public class SortieService
    {
        private readonly IProduitRepository _produitRepository;
        private readonly ISortieRepository _sortieRepository;
        private readonly IMouvementStockRepository _mouvementRepository;
        private readonly NotificationService _notificationService;

        public SortieService(
            IProduitRepository produitRepository,
            ISortieRepository sortieRepository,
            IMouvementStockRepository mouvementRepository,
            NotificationService notificationService)
        {
            _produitRepository = produitRepository;
            _sortieRepository = sortieRepository;
            _mouvementRepository = mouvementRepository;
            _notificationService = notificationService;
        }

        public bool CreerSortie(Sortie sortie, out string message)
        {
            var produit = _produitRepository.GetById(sortie.ProduitId);

            if (produit == null)
            {
                message = "Produit introuvable";
                return false;
            }

            if (sortie.Quantite > produit.Quantite)
            {
                message = $"Quantité sortie ({sortie.Quantite}) dépasse la quantité disponible ({produit.Quantite})";
                return false;
            }

            // 🔹 Mettre à jour la quantité du produit
            produit.Quantite -= sortie.Quantite;

            _produitRepository.Update(produit);
            _produitRepository.Save();

            // 🔹 Enregistrer la sortie
            _sortieRepository.Add(sortie);
            _sortieRepository.Save();

            // 🚨 Vérification seuil
            if (produit.Quantite <= produit.SeuilAlerte)
            {
                _notificationService.EnvoyerNotification(
                    "Secretaire",
                    $"Stock critique pour produit {produit.Nom}"
                );
            }

            // 🔥 Création automatique du mouvement de stock
            var mouvementSortie = new MouvementStock
            {
                TypeMouvement = TypeMouvement.Sortie,
                Quantite = sortie.Quantite,
                DateMouvement = sortie.DateSortie,
                ProduitId = sortie.ProduitId
            };

            _mouvementRepository.Add(mouvementSortie);
            _mouvementRepository.Save();

            message = "Sortie créée avec succès";

            return true;
        }
    }
}