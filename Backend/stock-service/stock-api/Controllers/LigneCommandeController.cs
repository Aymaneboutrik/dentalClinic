using Microsoft.AspNetCore.Mvc;
using StockApi.DTOs;
using StockApi.Exceptions;
using StockApi.Mappers;
using StockApi.Models;
using StockApi.Repositories.Interfaces;
using System.Linq;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LigneCommandeController : ControllerBase
    {
        private readonly ILigneCommandeRepository _ligneRepository;
        private readonly IProduitRepository _produitRepository;
        private readonly ICommandeRepository _commandeRepository;
        private readonly IMouvementStockRepository _mouvementRepository;

        public LigneCommandeController(
            ILigneCommandeRepository ligneRepository,
            IProduitRepository produitRepository,
            ICommandeRepository commandeRepository,
            IMouvementStockRepository mouvementRepository)
        {
            _ligneRepository = ligneRepository;
            _produitRepository = produitRepository;
            _commandeRepository = commandeRepository;
            _mouvementRepository = mouvementRepository;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var lignes = _ligneRepository.GetAll();
            var dto = lignes.Select(LigneCommandeMapper.ToDto);
            return Ok(dto);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var ligne = _ligneRepository.GetById(id);
            if (ligne == null) return NotFound(new { message = "Ligne de commande introuvable." });
            return Ok(LigneCommandeMapper.ToDto(ligne));
        }

        [HttpPost]
        public IActionResult Create(LigneCommandeDto dto)
        {
            var commande = _commandeRepository.GetById(dto.CommandeId);
            if (commande == null) throw new CommandeNotFoundException("Commande introuvable.");

            var produit = _produitRepository.GetById(dto.ProduitId);
            if (produit == null) throw new ProduitNotFoundException("Produit introuvable.");

            if (!produit.Actif) throw new ProduitInactifException("Impossible d'utiliser un produit inactif.");

            if (dto.Quantite <= 0) throw new InvalidQuantityException("La quantité de la ligne de commande doit être strictement positive.");
            if (dto.PrixUnitaire <= 0) throw new InvalidUnitPriceException("Le prix unitaire doit être strictement positif.");

            var ligne = LigneCommandeMapper.ToEntity(dto);

            _ligneRepository.Add(ligne);
            _ligneRepository.Save();

            return Ok(LigneCommandeMapper.ToDto(ligne));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, LigneCommandeDto dto)
        {
            var ligne = _ligneRepository.GetById(id);
            if (ligne == null) throw new NotFoundException("LigneCommande introuvable.");

            var commande = _commandeRepository.GetById(dto.CommandeId);
            if (commande == null) throw new CommandeNotFoundException("Commande introuvable.");

            var produit = _produitRepository.GetById(dto.ProduitId);
            if (produit == null) throw new ProduitNotFoundException("Produit introuvable.");

            if (!produit.Actif) throw new ProduitInactifException("Impossible d'utiliser un produit inactif.");

            if (dto.Quantite <= 0) throw new InvalidQuantityException("La quantité de la ligne de commande doit être strictement positive.");
            if (dto.PrixUnitaire <= 0) throw new InvalidUnitPriceException("Le prix unitaire doit être strictement positif.");

            ligne.ProduitId = dto.ProduitId;
            ligne.CommandeId = dto.CommandeId;
            ligne.Quantite = dto.Quantite;
            ligne.PrixUnitaire = dto.PrixUnitaire;

            _ligneRepository.Update(ligne);
            _ligneRepository.Save();

            return Ok(LigneCommandeMapper.ToDto(ligne));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var ligne = _ligneRepository.GetById(id);
            if (ligne == null) return NotFound(new { message = "LigneCommande introuvable." });

            // Supprimer les mouvements liés (Entrée et Sortie)
            var mouvements = _mouvementRepository.GetAll().Where(m => m.LigneCommandeId == id).ToList();
            foreach (var m in mouvements)
            {
                // Optionnel: Revert stock quantities here if needed. 
                // Given the user request only specified "suppression du mouvement", 
                // I will only delete the records to stay strictly within the request.
                _mouvementRepository.Delete(m);
            }
            _mouvementRepository.Save();

            _ligneRepository.Delete(ligne);
            _ligneRepository.Save();

            return NoContent();
        }
    }
}
