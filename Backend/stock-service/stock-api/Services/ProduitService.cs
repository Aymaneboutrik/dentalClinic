using StockApi.Models;
using StockApi.Repositories.Interfaces;
using System.Collections.Generic;
using System;

namespace StockApi.Services
{
    public class ProduitService
    {
        private readonly IProduitRepository _produitRepository;
        private readonly NotificationService _notificationService;

        public ProduitService(IProduitRepository produitRepository, NotificationService notificationService)
        {
            _produitRepository = produitRepository;
            _notificationService = notificationService;
        }

        public virtual List<Produit> GetAllProduits()
        {
            var produits = _produitRepository.GetAll();
            CheckPeremptionAlerts(produits);
            return produits;
        }

        public Produit? GetProduitById(int id)
        {
            return _produitRepository.GetById(id);
        }

        private void CheckPeremptionAlerts(List<Produit> produits)
        {
            bool hasChanges = false;
            foreach (var produit in produits)
            {
                // Si périmé aujourd'hui ou déjà périmé
                if (produit.DatePeremption <= DateTime.UtcNow)
                {
                    if (produit.Actif)
                    {
                        produit.Actif = false;
                        _produitRepository.Update(produit);
                        hasChanges = true;
                    }
                    _notificationService.AlertePeremption(produit.Nom, produit.DatePeremption);
                }
                else if (produit.DatePeremption <= DateTime.UtcNow.AddDays(7)) // Alerte préventive 7 jours avant
                {
                    _notificationService.AlertePeremption(produit.Nom, produit.DatePeremption);
                }

                if (produit.Quantite <= produit.SeuilAlerte)
                {
                    _notificationService.AlerteSeuilCritique(produit.Nom, produit.Quantite, produit.SeuilAlerte);
                }
                if (produit.Quantite == 0)
                {
                    _notificationService.AlerteStockEpuise(produit.Nom);
                }
            }

            if (hasChanges)
            {
                _produitRepository.Save();
            }
        }
    }
}
