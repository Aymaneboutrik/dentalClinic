using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using StockApi.Controllers;
using StockApi.Repositories.Interfaces;
using StockApi.Services;
using StockApi.Models;
using StockApi.DTOs;
using StockApi.Enums;
using System;

public class LigneCommandeControllerTests
{
    private readonly Mock<ILigneCommandeRepository> _ligneRepo = new();
    private readonly Mock<IProduitRepository> _produitRepo = new();
    private readonly Mock<ICommandeRepository> _commandeRepo = new();
    private readonly Mock<IMouvementStockRepository> _mouvementRepo = new();
    private readonly Mock<ProduitService> _produitService;

    public LigneCommandeControllerTests()
    {
        _produitService = new Mock<ProduitService>(
            _produitRepo.Object,
            _mouvementRepo.Object
        );
    }

    private LigneCommandeController CreateController()
    {
        return new LigneCommandeController(
            _ligneRepo.Object,
            _produitRepo.Object,
            _commandeRepo.Object,
            _produitService.Object,
            _mouvementRepo.Object
        );
    }

    [Fact]
    public void Create_CommandeInexistante_ReturnBadRequest()
    {
        // Arrange
        _commandeRepo.Setup(x => x.GetById(1)).Returns((Commande)null);
        var controller = CreateController();

        // Act
        var result = controller.Create(new LigneCommandeDto { CommandeId = 1 });

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Commande introuvable", badResult.Value);

        _commandeRepo.Verify(x => x.GetById(1), Times.Once);
        _ligneRepo.Verify(x => x.Add(It.IsAny<LigneCommande>()), Times.Never);
    }

    [Fact]
    public void Ajouter_ProduitExiste_UpdateQuantite()
    {
        // Arrange
        var ligne = new LigneCommande
        {
            Id = 1,
            Nom = "Test",
            Quantite = 5,
            Etat = EtatLigneCommande.NonAjoutee,
            CommandeId = 1
        };
        _ligneRepo.Setup(x => x.GetById(1)).Returns(ligne);

        // Commande validée
        var commande = new Commande
        {
            Id = 1,
            Statut = OrderStatus.Validee
        };
        _commandeRepo.Setup(x => x.GetById(1)).Returns(commande);

        var produit = new Produit
        {
            Id = 1,
            Nom = "Test",
            Quantite = 10
        };
        _produitRepo.Setup(x => x.GetByName("Test")).Returns(produit);

        var controller = CreateController();

        // Act
        var result = controller.Ajouter(1, new ProduitDto());

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Produit mis à jour", okResult.Value);

        _ligneRepo.Verify(x => x.GetById(1), Times.Once);
        _produitRepo.Verify(x => x.GetByName("Test"), Times.Once);
        _ligneRepo.Verify(x => x.Update(It.Is<LigneCommande>(l => l.Quantite == 5)), Times.Once);
    }

    [Fact]
    public void Ajouter_ProduitInexistant_CreationProduit()
    {
        // Arrange
        var ligne = new LigneCommande
        {
            Id = 1,
            Nom = "Test",
            Quantite = 5,
            Etat = EtatLigneCommande.NonAjoutee,
            CommandeId = 1
        };
        _ligneRepo.Setup(x => x.GetById(1)).Returns(ligne);

        // Commande validée
        var commande = new Commande
        {
            Id = 1,
            Statut = OrderStatus.Validee
        };
        _commandeRepo.Setup(x => x.GetById(1)).Returns(commande);

        // Pas de produit existant avec ce nom
        _produitRepo.Setup(x => x.GetByName("Test")).Returns((Produit)null);

        // Mock ProduitService
        _produitService.Setup(x => x.CreerDepuisLigneCommande(
            It.IsAny<LigneCommande>(),
            It.IsAny<ProduitDto>()
        )).Returns(new Produit { Id = 1, Nom = "Test", Quantite = 5 });

        var controller = CreateController();

        // Act
        var produitDto = new ProduitDto
        {
            Nom = "Test",
            Quantite = 5,
            Description = "Produit test",
            SeuilAlerte = 1,
            DatePeremption = new DateTime(2030, 12, 31)
        };
        var result = controller.Ajouter(1, produitDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Produit créé et ajouté", okResult.Value);

        _ligneRepo.Verify(x => x.GetById(1), Times.Once);
        _produitRepo.Verify(x => x.GetByName("Test"), Times.Once);
        _produitService.Verify(x => x.CreerDepuisLigneCommande(
            It.Is<LigneCommande>(l => l.Id == 1),
            It.Is<ProduitDto>(p => p.Nom == "Test" && p.Quantite == 5)
        ), Times.Once);
    }
}