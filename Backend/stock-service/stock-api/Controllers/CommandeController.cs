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
    public class CommandeController : ControllerBase
    {
        private readonly ICommandeRepository _commandeRepository;
        private readonly IFournisseurRepository _fournisseurRepository;
        private readonly ILigneCommandeRepository _ligneRepository;

        public CommandeController(
            ICommandeRepository commandeRepository,
            IFournisseurRepository fournisseurRepository,
            ILigneCommandeRepository ligneRepository)
        {
            _commandeRepository = commandeRepository;
            _fournisseurRepository = fournisseurRepository;
            _ligneRepository = ligneRepository;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var commandes = _commandeRepository.GetAll();
            var dto = commandes.Select(CommandeMapper.ToDto);
            return Ok(dto);
        }

        [HttpPost]
        public IActionResult Create(CommandeDto dto)
        {
            var fournisseur = _fournisseurRepository.GetById(dto.FournisseurId);
            if (fournisseur == null) throw new FournisseurNotFoundException("Fournisseur introuvable.");

            var commande = CommandeMapper.ToEntity(dto);
            commande.Date = DateTime.UtcNow; // Date automatique
            commande.Statut = Enums.OrderStatus.EnAttente;

            _commandeRepository.Add(commande);
            _commandeRepository.Save();

            return Ok(CommandeMapper.ToDto(commande));
        }

        [HttpGet("{id}/bon")]
        public IActionResult GetBonCommande(int id)
        {
            var commande = _commandeRepository.GetById(id);
            if (commande == null) throw new NotFoundException("Commande introuvable.");

            var fournisseur = _fournisseurRepository.GetById(commande.FournisseurId);
            var lignes = _ligneRepository.GetByCommandeId(id);

            var bonDto = new
            {
                Id = commande.Id,
                Nom = commande.Nom,
                Date = commande.Date,
                Statut = commande.Statut,
                FournisseurId = commande.FournisseurId,
                Fournisseur = fournisseur != null ? new { fournisseur.Id, fournisseur.Nom, fournisseur.Telephone, fournisseur.Adresse } : null,
                Lignes = lignes.Select(l => new { l.Id, l.ProduitId, l.Quantite, l.PrixUnitaire, l.SousTotal })
            };

            return Ok(bonDto);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] CommandeDto dto)
        {
            var commande = _commandeRepository.GetById(id);
            if (commande == null) return NotFound();

            if (commande.Statut != Enums.OrderStatus.EnAttente)
                throw new StockApi.Exceptions.InvalidOperationException("Seules les commandes en attente peuvent être modifiées.");

            var fournisseur = _fournisseurRepository.GetById(dto.FournisseurId);
            if (fournisseur == null) throw new FournisseurNotFoundException("Fournisseur introuvable.");

            commande.Nom = dto.Nom;
            commande.FournisseurId = dto.FournisseurId;
            if (dto.Date != default)
            {
                commande.Date = dto.Date;
            }

            _commandeRepository.Update(commande);
            _commandeRepository.Save();

            return Ok(CommandeMapper.ToDto(commande));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var commande = _commandeRepository.GetById(id);
            if (commande == null) return NotFound();

            _commandeRepository.Delete(commande);
            _commandeRepository.Save();

            return NoContent();
        }
    }
}
