using Xunit;
using Moq;
using StockApi.Services;
using StockApi.Repositories.Interfaces;
using StockApi.Models;
using StockApi.Enums;
using StockApi.Exceptions;
using System;
using System.Collections.Generic;

public class MouvementStockServiceTests
{
    private readonly Mock<IMouvementStockRepository> _mouvementStockRepo = new();
    private readonly Mock<IProduitRepository> _produitRepo = new();

    private MouvementStockService CreateService()
    {
        return new MouvementStockService(_mouvementStockRepo.Object, _produitRepo.Object);
    }

    [Fact]
    public void CreateEntreeMouvement_CreatesMouvementAndUpdatesStock()
    {
        // Arrange
        var service = CreateService();
        var ligneCommande = new LigneCommande
        {
            Id = 1,
            ProduitId = 10,
            Quantite = 5,
            PrixUnitaire = 10.0m
        };
        var produit = new Produit { Id = 10, Quantite = 20 };
        _produitRepo.Setup(x => x.GetById(10)).Returns(produit);

        // Act
        service.CreateEntreeMouvement(ligneCommande);

        // Assert
        _mouvementStockRepo.Verify(x => x.Add(It.Is<MouvementStock>(m =>
            m.TypeMouvement == TypeMouvement.Entree &&
            m.Quantite == 5 &&
            m.ProduitId == 10 &&
            m.LigneCommandeId == 1)), Times.Once);
        Assert.Equal(25, produit.Quantite); // 20 + 5
        _produitRepo.Verify(x => x.Update(produit), Times.Once);
    }

    [Fact]
    public void CreateSortieMouvement_CreatesMouvementAndUpdatesStock()
    {
        // Arrange
        var service = CreateService();
        var produit = new Produit { Id = 10, Quantite = 20, Actif = true };
        _produitRepo.Setup(x => x.GetById(10)).Returns(produit);

        // Act
        service.CreateSortieMouvement(10, 3);

        // Assert
        _mouvementStockRepo.Verify(x => x.Add(It.Is<MouvementStock>(m =>
            m.TypeMouvement == TypeMouvement.Sortie &&
            m.Quantite == 3 &&
            m.ProduitId == 10 &&
            m.LigneCommandeId == null)), Times.Once);
        Assert.Equal(17, produit.Quantite); // 20 - 3
        _produitRepo.Verify(x => x.Update(produit), Times.Once);
    }

    [Fact]
    public void CreateSortieMouvement_ProduitInactif_ThrowsException()
    {
        // Arrange
        var service = CreateService();
        var produit = new Produit { Id = 10, Quantite = 20, Actif = false };
        _produitRepo.Setup(x => x.GetById(10)).Returns(produit);

        // Act & Assert
        Assert.Throws<ProduitInactifException>(() => service.CreateSortieMouvement(10, 3));
    }

    [Fact]
    public void CreateSortieMouvement_InsufficientStock_ThrowsException()
    {
        // Arrange
        var service = CreateService();
        var produit = new Produit { Id = 10, Quantite = 2, Actif = true };
        _produitRepo.Setup(x => x.GetById(10)).Returns(produit);

        // Act & Assert
        Assert.Throws<InsufficientStockException>(() => service.CreateSortieMouvement(10, 5));
    }

    [Fact]
    public void CreateEntreeMouvement_ProduitNotFound_DoesNotUpdateStock()
    {
        // Arrange
        var service = CreateService();
        var ligneCommande = new LigneCommande
        {
            Id = 1,
            ProduitId = 10,
            Quantite = 5
        };
        _produitRepo.Setup(x => x.GetById(10)).Returns((Produit)null);

        // Act
        service.CreateEntreeMouvement(ligneCommande);

        // Assert
        _mouvementStockRepo.Verify(x => x.Add(It.IsAny<MouvementStock>()), Times.Once);
        _produitRepo.Verify(x => x.Update(It.IsAny<Produit>()), Times.Never);
    }
}