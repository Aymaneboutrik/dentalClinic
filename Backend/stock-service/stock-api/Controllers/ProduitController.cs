using Microsoft.AspNetCore.Mvc;
using StockApi.DTOs;
using StockApi.Exceptions;
using StockApi.Mappers;
using StockApi.Repositories.Interfaces;
using StockApi.Services;
using System;
using System.Linq;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProduitController : ControllerBase
    {
        private readonly IProduitRepository _produitRepository;
        private readonly ProduitService _produitService;

        public ProduitController(
            IProduitRepository produitRepository,
            ProduitService produitService)
        {
            _produitRepository = produitRepository;
            _produitService = produitService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var produits = _produitService.GetAllProduits();
            var dto = produits.Select(ProduitMapper.ToDto);
            return Ok(dto);
        }

        [HttpPost]
        public IActionResult Create(ProduitDto dto)
        {
            if (dto.Quantite <= 0) throw new InvalidQuantityException("La quantité du produit doit être strictement positive.");
            if (dto.SeuilAlerte <= 0) throw new InvalidSeuilException("Le seuil d'alerte doit être strictement positif.");
            if (dto.DatePeremption <= DateTime.UtcNow) throw new InvalidPeremptionDateException("La date de péremption doit être strictement supérieure à la date d'aujourd'hui.");
            
            var existing = _produitRepository.GetByName(dto.Nom);
            if (existing != null) throw new DuplicateProductNameException("Un produit avec ce nom existe déjà.");

            var produit = ProduitMapper.ToEntity(dto);
            produit.Actif = false; // Par défaut à la création

            _produitRepository.Add(produit);
            _produitRepository.Save();

            return Ok(ProduitMapper.ToDto(produit));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, ProduitDto dto)
        {
            var produit = _produitRepository.GetById(id);
            if (produit == null) throw new NotFoundException("Produit introuvable.");

            if (!produit.Actif) throw new ProduitInactifException("Impossible de modifier un produit inactif.");

            if (dto.Quantite <= 0) throw new InvalidQuantityException("La quantité du produit doit être strictement positive.");
            if (dto.SeuilAlerte <= 0) throw new InvalidSeuilException("Le seuil d'alerte doit être strictement positif.");
            if (dto.DatePeremption <= DateTime.UtcNow) throw new InvalidPeremptionDateException("La date de péremption doit être strictement supérieure à la date d'aujourd'hui.");

            var existing = _produitRepository.GetByName(dto.Nom);
            if (existing != null && existing.Id != id) throw new DuplicateProductNameException("Un produit avec ce nom existe déjà.");

            produit.Nom = dto.Nom;
            produit.Quantite = dto.Quantite;
            produit.Description = dto.Description;
            produit.SeuilAlerte = dto.SeuilAlerte;
            produit.DatePeremption = dto.DatePeremption;
            // Ne pas mettre à jour "Actif" ici, on le gère avec Toggle.

            _produitRepository.Update(produit);
            _produitRepository.Save();

            return Ok(ProduitMapper.ToDto(produit));
        }

        [HttpPut("{id}/toggle-actif")]
        public IActionResult ToggleActif(int id)
        {
            var produit = _produitRepository.GetById(id);
            if (produit == null) throw new NotFoundException("Produit introuvable.");

            produit.Actif = !produit.Actif;

            _produitRepository.Update(produit);
            _produitRepository.Save();

            return Ok(ProduitMapper.ToDto(produit));
        }

        // We completely replace the Delete operation as requested, by removing the Delete endpoint 
        // since we use Activer/Desactiver now. Or keep Delete but the instructions say: 
        // "remplacer le bouton supprimer a cote de modifier par un bouton toggle Activer".
        // I will just remove the Delete method.
    }
}