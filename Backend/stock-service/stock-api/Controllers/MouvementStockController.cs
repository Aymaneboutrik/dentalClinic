using Microsoft.AspNetCore.Mvc;
using StockApi.Models;
using StockApi.Services;
using StockApi.DTOs;
using StockApi.Mappers;
using StockApi.Repositories.Interfaces;
using StockApi.Exceptions;
using System.Linq;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MouvementStockController : ControllerBase
    {
        private readonly IMouvementStockRepository _mouvementRepository;
        private readonly ILigneCommandeRepository _ligneCommandeRepository;
        private readonly MouvementStockService _mouvementStockService;
        private readonly NotificationService _notificationService;
        private readonly IProduitRepository _produitRepository;

        public MouvementStockController(
            IMouvementStockRepository mouvementRepository,
            ILigneCommandeRepository ligneCommandeRepository,
            MouvementStockService mouvementStockService,
            NotificationService notificationService,
            IProduitRepository produitRepository)
        {
            _mouvementRepository = mouvementRepository;
            _ligneCommandeRepository = ligneCommandeRepository;
            _mouvementStockService = mouvementStockService;
            _notificationService = notificationService;
            _produitRepository = produitRepository;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var mouvements = _mouvementRepository.GetAll();
            var dto = mouvements.Select(MouvementStockMapper.ToDto);
            return Ok(dto);
        }

        [HttpPost("sortie")]
        public IActionResult CreerSortie(MouvementStockDto dto)
        {
            if (!dto.ProduitId.HasValue) throw new ValidationException("L'ID du produit est requis.");

            // Déterminer LigneCommandeId automatiquement
            var lignes = _ligneCommandeRepository.GetAll().Where(l => l.ProduitId == dto.ProduitId.Value).ToList();
            int? ligneCommandeId = lignes.Count == 1 ? lignes.First().Id : null;

            _mouvementStockService.CreateSortieMouvement(dto.ProduitId.Value, dto.Quantite, ligneCommandeId);
            
            _mouvementRepository.Save();
            _produitRepository.Save();

            // Vérifier seuil d'alerte
            var produit = _produitRepository.GetById(dto.ProduitId.Value);
            if (produit != null && produit.Quantite <= produit.SeuilAlerte)
            {
                _notificationService.EnvoyerNotification("Secretaire", $"Stock critique : Produit {produit.Nom} a atteint son seuil d'alerte ({produit.Quantite}).");
            }

            return Ok(new { message = "Sortie de stock enregistrée avec succès." });
        }
    }
}