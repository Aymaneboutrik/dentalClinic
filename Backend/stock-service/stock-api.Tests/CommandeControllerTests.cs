using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StockApi.Controllers;
using StockApi.Repositories.Interfaces;
using StockApi.DTOs;
using StockApi.Models;
using StockApi.Enums;
using System.Collections.Generic;

public class CommandeControllerTests
{
    private readonly Mock<ICommandeRepository> _commandeRepo = new();
    private readonly Mock<ILigneCommandeRepository> _ligneRepo = new();

    private CommandeController CreateController()
    {
        return new CommandeController(_commandeRepo.Object, _ligneRepo.Object);
    }

    [Fact]
    public void GetBonCommande_NotFound()
    {
        // Arrange
        _commandeRepo.Setup(x => x.GetById(1)).Returns((Commande)null);
        var controller = CreateController();

        // Act
        var result = controller.GetBonCommande(1);

        // Assert
        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Commande introuvable", notFound.Value);

        _commandeRepo.Verify(x => x.GetById(1), Times.Once);
        _ligneRepo.Verify(x => x.GetByCommandeId(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public void GetBonCommande_SansLignes()
    {
        // Arrange
        var commande = new Commande
        {
            Id = 1,
            Nom = "CommandeTest",
            Date = DateTime.Now,
            Statut = OrderStatus.EnAttente,
            FournisseurId = 42
        };

        _commandeRepo.Setup(x => x.GetById(1)).Returns(commande);
        _ligneRepo.Setup(x => x.GetByCommandeId(1)).Returns(new List<LigneCommande>());

        var controller = CreateController();

        // Act
        var result = controller.GetBonCommande(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var dtoResult = Assert.IsType<CommandeAvecLignesDto>(okResult.Value);

        Assert.Equal(commande.Id, dtoResult.Id);
        Assert.Equal(commande.Nom, dtoResult.Nom);
        Assert.Equal(commande.Date, dtoResult.Date);
        Assert.Equal(commande.Statut, dtoResult.Statut);
        Assert.Equal(commande.FournisseurId, dtoResult.FournisseurId);
        Assert.Empty(dtoResult.Lignes);
           
        _commandeRepo.Verify(x => x.GetById(1), Times.Once);
        _ligneRepo.Verify(x => x.GetByCommandeId(1), Times.Once);
    }

    [Fact]
    public void GetBonCommande_AvecLignes()
    {
        // Arrange
        var commande = new Commande
        {
            Id = 1,
            Nom = "CommandeTest",
            Date = DateTime.Now,
            Statut = OrderStatus.EnAttente,
            FournisseurId = 42
        };

        var lignes = new List<LigneCommande>
        {
        new LigneCommande { Nom = "Test", Quantite = 2 }
        };

        _commandeRepo.Setup(x => x.GetById(1)).Returns(commande);
        _ligneRepo.Setup(x => x.GetByCommandeId(1)).Returns(lignes);

        var controller = CreateController();

        // Act
        var result = controller.GetBonCommande(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var dtoResult = Assert.IsType<CommandeAvecLignesDto>(okResult.Value);

        Assert.Equal(commande.Id, dtoResult.Id);
        Assert.Equal(commande.Nom, dtoResult.Nom);
        Assert.Equal(commande.Date, dtoResult.Date);
        Assert.Equal(commande.Statut, dtoResult.Statut);
        Assert.Equal(commande.FournisseurId, dtoResult.FournisseurId);

        Assert.Single(dtoResult.Lignes);
        Assert.Equal("Test", dtoResult.Lignes[0].Nom);
        Assert.Equal(2, dtoResult.Lignes[0].Quantite);

        _commandeRepo.Verify(x => x.GetById(1), Times.Once);
        _ligneRepo.Verify(x => x.GetByCommandeId(1), Times.Once);
    }
}