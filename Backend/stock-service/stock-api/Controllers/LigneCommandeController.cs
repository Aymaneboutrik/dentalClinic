using Microsoft.AspNetCore.Mvc;
using StockApi.DTOs;
using StockApi.Enums;
using StockApi.Mappers;
using StockApi.Models;
using StockApi.Repositories.Interfaces;
using StockApi.Services;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LigneCommandeController : ControllerBase
    {
        private readonly ILigneCommandeRepository _ligneRepository;
        private readonly IProduitRepository _produitRepository;
        private readonly ICommandeRepository _commandeRepository;
        private readonly ProduitService _produitService;

        public LigneCommandeController(
            ILigneCommandeRepository ligneRepository,
            IProduitRepository produitRepository,
            ICommandeRepository commandeRepository,
            ProduitService produitService)
        {
            _ligneRepository = ligneRepository;
            _produitRepository = produitRepository;
            _commandeRepository = commandeRepository;
            _produitService = produitService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var lignes = _ligneRepository.GetAll();
            var dto = lignes.Select(LigneCommandeMapper.ToDto);
            return Ok(dto);
        }

        [HttpPost]
        public IActionResult Create(LigneCommandeDto dto)
        {
            var commande = _commandeRepository.GetById(dto.CommandeId);

            if (commande == null)
                return BadRequest("Commande introuvable");

            var ligne = LigneCommandeMapper.ToEntity(dto);

            // Etat toujours NonAjoutee à la création
            ligne.Etat = EtatLigneCommande.NonAjoutee;

            _ligneRepository.Add(ligne);
            _ligneRepository.Save();

            return Ok(LigneCommandeMapper.ToDto(ligne));
        }

        [HttpPost("{id}/ajouter")]
        public IActionResult Ajouter(int id, ProduitDto produitDto)
        {
            var ligne = _ligneRepository.GetById(id);

            if (ligne == null)
                return NotFound("LigneCommande introuvable");

            if (ligne.Etat == EtatLigneCommande.Ajoutee)
                return BadRequest("Déjà ajoutée");

            // 🔎 Vérifier si produit existe déjà
            var produitExistant = _produitRepository.GetByName(ligne.Nom);

            if (produitExistant != null)
            {
                // Produit existe → ajouter quantité
                produitExistant.Quantite += ligne.Quantite;

                _produitRepository.Update(produitExistant);
                _produitRepository.Save();

                // 🔹 Retour message produit existant
                ligne.Etat = EtatLigneCommande.Ajoutee;
                _ligneRepository.Update(ligne);
                _ligneRepository.Save();

                return Ok("Produit mis à jour");
            }
            else
            {
                // Produit inexistant → créer nouveau produit
                _produitService.CreerDepuisLigneCommande(ligne, produitDto);

                ligne.Etat = EtatLigneCommande.Ajoutee;
                _ligneRepository.Update(ligne);
                _ligneRepository.Save();

                return Ok("Produit créé et ajouté");
            }
        }
    }
}