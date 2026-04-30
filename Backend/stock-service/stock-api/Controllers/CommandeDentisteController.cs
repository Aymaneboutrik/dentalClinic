using Microsoft.AspNetCore.Mvc;
using StockApi.DTOs;
using StockApi.Enums;
using StockApi.Repositories.Interfaces;
using StockApi.Services;
using StockApi.Models;
using StockApi.Exceptions;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommandeDentisteController : ControllerBase
    {
        private readonly ICommandeRepository _commandeRepository;
        private readonly ILigneCommandeRepository _ligneCommandeRepository;
        private readonly MouvementStockService _mouvementStockService;
        private readonly ICommandeValidationRepository _validationRepository;

        public CommandeDentisteController(
            ICommandeRepository commandeRepository,
            ILigneCommandeRepository ligneCommandeRepository,
            MouvementStockService mouvementStockService,
            ICommandeValidationRepository validationRepository)
        {
            _commandeRepository = commandeRepository;
            _ligneCommandeRepository = ligneCommandeRepository;
            _mouvementStockService = mouvementStockService;
            _validationRepository = validationRepository;
        }

        [HttpPost("{id}/valider")]
        public IActionResult Valider(int id)
        {
            var commande = _commandeRepository.GetById(id);
            if (commande == null) throw new NotFoundException("Commande introuvable.");

            if (commande.Statut != OrderStatus.EnAttente)
                throw new StockApi.Exceptions.InvalidOperationException("La commande n'est pas en attente.");

            commande.Statut = OrderStatus.Validee;
            _commandeRepository.Update(commande);

            // Créer mouvements automatiques d'entrée
            var lignes = _ligneCommandeRepository.GetByCommandeId(id);
            foreach (var ligne in lignes)
            {
                _mouvementStockService.CreateEntreeMouvement(ligne);
            }

            _commandeRepository.Save();
            _ligneCommandeRepository.Save();

            return Ok(new { message = "Commande validée et stock mis à jour." });
        }

        [HttpPost("{id}/refuser")]
        public IActionResult Refuser(int id, [FromBody] string note)
        {
            var commande = _commandeRepository.GetById(id);
            if (commande == null) throw new NotFoundException("Commande introuvable.");

            if (commande.Statut != OrderStatus.EnAttente)
                throw new StockApi.Exceptions.InvalidOperationException("La commande n'est pas en attente.");

            commande.Statut = OrderStatus.Refusee;
            _commandeRepository.Update(commande);

            var validation = new CommandeValidation
            {
                CommandeId = id,
                TypeAction = "Refusee",
                Commentaire = note,
                DateValidation = DateTime.UtcNow
            };
            _validationRepository.Add(validation);

            _commandeRepository.Save();
            _validationRepository.Save();

            return Ok(new { message = "Commande refusée." });
        }
    }
}
