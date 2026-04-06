using Microsoft.AspNetCore.Mvc;
using StockApi.DTOs;
using StockApi.Mappers;
using StockApi.Models;
using StockApi.Repositories.Interfaces;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommandeController : ControllerBase
    {
        private readonly ICommandeRepository _commandeRepository;
        private readonly ILigneCommandeRepository _ligneCommandeRepository;

        public CommandeController(
            ICommandeRepository commandeRepository,
            ILigneCommandeRepository ligneCommandeRepository)
        {
            _commandeRepository = commandeRepository;
            _ligneCommandeRepository = ligneCommandeRepository;
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
            var commande = CommandeMapper.ToEntity(dto);

            _commandeRepository.Add(commande);
            _commandeRepository.Save();

            return Ok(CommandeMapper.ToDto(commande));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, CommandeDto dto)
        {
            var commande = _commandeRepository.GetById(id);

            if (commande == null)
                return NotFound("Commande introuvable");

            commande.Nom = dto.Nom;
            commande.Date = dto.Date;
            _commandeRepository.Update(commande);
            _commandeRepository.Save();

            return Ok(CommandeMapper.ToDto(commande));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var commande = _commandeRepository.GetById(id);

            if (commande == null)
                return NotFound("Commande introuvable");

            _commandeRepository.Delete(commande);
            _commandeRepository.Save();

            return Ok("Commande supprimée");
        }

        [HttpGet("{id}/bon")]
        public IActionResult GetBonCommande(int id)
        {
            var commande = _commandeRepository.GetById(id);

            if (commande == null)
                return NotFound("Commande introuvable");

            // 🔥 récupérer lignes
            var lignes = _ligneCommandeRepository.GetByCommandeId(id);

            var dto = new CommandeAvecLignesDto
            {
                Id = commande.Id,
                Nom = commande.Nom,
                Date = commande.Date,
                Statut = commande.Statut,
                FournisseurId = commande.FournisseurId,
                Lignes = lignes.Select(LigneCommandeMapper.ToDto).ToList()
            };

            return Ok(dto);
        }
    }
}