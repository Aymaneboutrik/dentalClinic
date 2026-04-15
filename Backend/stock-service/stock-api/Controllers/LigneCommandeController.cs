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
        private readonly IMouvementStockRepository _mouvementRepository;

        public LigneCommandeController(
            ILigneCommandeRepository ligneRepository,
            IProduitRepository produitRepository,
            ICommandeRepository commandeRepository,
            ProduitService produitService,
            IMouvementStockRepository mouvementRepository)
        {
            _ligneRepository = ligneRepository;
            _produitRepository = produitRepository;
            _commandeRepository = commandeRepository;
            _produitService = produitService;
            _mouvementRepository = mouvementRepository;
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

            // 🔒 Vérifier le statut de la commande associée
            var commande = _commandeRepository.GetById(ligne.CommandeId);
            if (commande == null)
                return BadRequest("Commande associée introuvable");

            if (commande.Statut == OrderStatus.Refusee)
                return BadRequest("Impossible d'ajouter : la commande associée a été refusée.");

            if (commande.Statut == OrderStatus.ModificationExigee)
                return BadRequest("Impossible d'ajouter : une modification a été exigée pour cette commande.");

            if (commande.Statut != OrderStatus.Validee)
                return BadRequest("Impossible d'ajouter : la commande doit être validée avant d'ajouter les produits.");

            int? produitId = null;

            // 🔎 Vérifier si produit existe déjà
            var produitExistant = _produitRepository.GetByName(ligne.Nom);

            if (produitExistant != null)
            {
                produitExistant.Quantite += ligne.Quantite;
                _produitRepository.Update(produitExistant);
                _produitRepository.Save();

                produitId = produitExistant.Id;

                ligne.Etat = EtatLigneCommande.Ajoutee;
                _ligneRepository.Update(ligne);
                _ligneRepository.Save();

                // 📦 Créer mouvement stock Entrée avec CommandeId
                var mouvement = new MouvementStock
                {
                    TypeMouvement = TypeMouvement.Entree,
                    Quantite = ligne.Quantite,
                    DateMouvement = DateTime.UtcNow,
                    ProduitId = produitId,
                    CommandeId = ligne.CommandeId
                };
                _mouvementRepository.Add(mouvement);
                _mouvementRepository.Save();

                return Ok("Produit mis à jour");
            }
            else
            {
                var nouveauProduit = _produitService.CreerDepuisLigneCommande(ligne, produitDto);
                produitId = nouveauProduit?.Id;

                ligne.Etat = EtatLigneCommande.Ajoutee;
                _ligneRepository.Update(ligne);
                _ligneRepository.Save();

                // 📦 Créer mouvement stock Entrée avec CommandeId
                var mouvement = new MouvementStock
                {
                    TypeMouvement = TypeMouvement.Entree,
                    Quantite = ligne.Quantite,
                    DateMouvement = DateTime.UtcNow,
                    ProduitId = produitId,
                    CommandeId = ligne.CommandeId
                };
                _mouvementRepository.Add(mouvement);
                _mouvementRepository.Save();

                return Ok("Produit créé et ajouté");
            }
        }
    }
}
