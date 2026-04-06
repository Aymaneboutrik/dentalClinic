using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StockApi.Controllers;
using StockApi.Repositories.Interfaces;
using StockApi.Services;
using StockApi.Models;
using StockApi.DTOs;
using StockApi.Enums;
using System.Collections.Generic;

public class CommandeDentisteControllerTests
{
    private readonly Mock<ICommandeRepository> _commandeRepo = new();
    private readonly Mock<ILigneCommandeRepository> _ligneRepo = new();
    private readonly Mock<IMouvementStockRepository> _mouvRepo = new();
    private readonly Mock<NotificationService> _notif = new();

    private CommandeDentisteController CreateController()
    {
        return new CommandeDentisteController(
            _commandeRepo.Object,
            _ligneRepo.Object,
            _mouvRepo.Object,
            _notif.Object
        );
    }

    [Fact]
    public void Valider_CommandeOK()
    {
        var commande = new Commande { Id = 1 };
        _commandeRepo.Setup(x => x.GetById(1)).Returns(commande);

        var controller = CreateController();
        var result = controller.Valider(1);

        // Vérifie le type et le contenu du résultat
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Commande validée", okResult.Value);

        // Vérifie que les méthodes du repository ont été appelées correctement
        _commandeRepo.Verify(x => x.GetById(1), Times.Once);
        _commandeRepo.Verify(x => x.Update(It.Is<Commande>(c => c.Id == 1)), Times.Once);

        // Vérifier que la notification a été envoyée
        _notif.Verify(
            x => x.EnvoyerNotification(
                It.IsAny<string>(),
                It.Is<string>(msg => msg.Contains("validée"))
            ),
            Times.Once
        );
    }

    [Fact]
    public void Refuser_CommandeAvecNote_OK()
    {
        var commande = new Commande { Id = 1 };
        _commandeRepo.Setup(x => x.GetById(1)).Returns(commande);

        var controller = CreateController();
        var result = controller.Refuser(1, "Pas conforme");

        // Vérifie le type et le contenu du résultat
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Commande refusée avec note", okResult.Value); // <-- corrigé

        // Vérifie que les méthodes du repository ont été appelées correctement
        _commandeRepo.Verify(x => x.GetById(1), Times.Once);
        _commandeRepo.Verify(x => x.Update(It.Is<Commande>(c => c.Id == 1)), Times.Once);

        // Vérifier que la notification a été envoyée avec la note
        _notif.Verify(
            x => x.EnvoyerNotification(
                It.IsAny<string>(),
                It.Is<string>(msg => msg.Contains("refusée") && msg.Contains("Pas conforme"))
            ),
            Times.Once
        );
    }

    [Fact]
    public void ExigerModification_CreeMouvement()
    {
        // Arrange
        var commande = new Commande { Id = 1 };
        _commandeRepo.Setup(x => x.GetById(1)).Returns(commande);

        _ligneRepo.Setup(x => x.GetByCommandeId(1))
            .Returns(new List<LigneCommande>
            {
            new LigneCommande { Quantite = 2 },
            new LigneCommande { Quantite = 3 }
            });

        var controller = CreateController();

        // Act
        var result = controller.ExigerModification(1);

        // Assert : le mouvement est créé avec le bon type et la bonne quantité
        _mouvRepo.Verify(x => x.Add(It.Is<MouvementStock>(
            m => m.TypeMouvement == TypeMouvement.Modifiee &&
                 m.Quantite == 5
        )), Times.Once);

        // Vérifier que la notification a été envoyée avec un message contenant "modification"
        _notif.Verify(
            x => x.EnvoyerNotification(
                It.IsAny<string>(),
                It.Is<string>(msg => msg.Contains("modification"))
            ),
            Times.Once
        );

        // Vérifie le type de résultat et le message retourné
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Modification exigée", okResult.Value);

        // Vérifie que la commande a été récupérée et mise à jour
        _commandeRepo.Verify(x => x.GetById(1), Times.Once);
        _commandeRepo.Verify(x => x.Update(It.Is<Commande>(c => c.Id == 1)), Times.Once);
    }
}