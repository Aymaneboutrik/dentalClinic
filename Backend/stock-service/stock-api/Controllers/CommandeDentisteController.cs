using Microsoft.AspNetCore.Mvc;
using StockApi.Repositories.Interfaces;
using StockApi.Services;
using StockApi.Models;
using StockApi.Enums;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommandeDentisteController : ControllerBase
    {
        private readonly ICommandeRepository _commandeRepository;
        private readonly ILigneCommandeRepository _ligneCommandeRepository;
        private readonly IMouvementStockRepository _mouvementRepository;
        private readonly NotificationService _notificationService;

        public CommandeDentisteController(
            ICommandeRepository commandeRepository,
            ILigneCommandeRepository ligneCommandeRepository,
            IMouvementStockRepository mouvementRepository,
            NotificationService notificationService)
        {
            _commandeRepository = commandeRepository;
            _ligneCommandeRepository = ligneCommandeRepository;
            _mouvementRepository = mouvementRepository;
            _notificationService = notificationService;
        }

        [HttpPost("{id}/valider")]
        public IActionResult Valider(int id)
        {
            var commande = _commandeRepository.GetById(id);
            if (commande == null) return NotFound();

            commande.Statut = OrderStatus.Validee;
            _commandeRepository.Update(commande);
            _commandeRepository.Save();

            _notificationService.EnvoyerNotification("Secretaire", $"Commande {id} validée");
            return Ok("Commande validée");
        }

        [HttpPost("{id}/refuser")]
        public IActionResult Refuser(int id, [FromBody] string note)
        {
            var commande = _commandeRepository.GetById(id);
            if (commande == null) return NotFound();

            commande.Statut = OrderStatus.Refusee;
            _commandeRepository.Update(commande);
            _commandeRepository.Save();

            _notificationService.EnvoyerNotification("Secretaire", $"Commande {id} refusée. Note: {note}");
            return Ok("Commande refusée avec note");
        }

        [HttpPost("{id}/exiger-modif")]
        public IActionResult ExigerModification(int id)
        {
            var commande = _commandeRepository.GetById(id);
            if (commande == null) return NotFound();

            commande.Statut = OrderStatus.ModificationExigee;

            _commandeRepository.Update(commande);
            _commandeRepository.Save();

            // 🔹 récupérer les lignes de commande
            var lignes = _ligneCommandeRepository.GetByCommandeId(id);

            // 🔹 calcul somme des quantités
            int sommeQuantites = lignes.Sum(l => l.Quantite);

            // 🔥 création mouvement stock "modifiee"
            var mouvementModifiee = new MouvementStock
            {
                TypeMouvement = TypeMouvement.Modifiee,
                Quantite = sommeQuantites,
                DateMouvement = null,
                CommandeId = id
            };

            _mouvementRepository.Add(mouvementModifiee);
            _mouvementRepository.Save();

            _notificationService.EnvoyerNotification("Secretaire", $"Commande {id} nécessite une modification");

            return Ok("Modification exigée");
        }
    }
}