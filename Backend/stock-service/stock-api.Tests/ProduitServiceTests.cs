using Xunit;
using Moq;
using StockApi.Services;
using StockApi.Repositories.Interfaces;
using StockApi.Models;
using System;
using System.Collections.Generic;

public class ProduitServiceTests
{
    private readonly Mock<IProduitRepository> _produitRepo = new();
    private readonly Mock<NotificationService> _notificationService = new();

    private ProduitService CreateService()
    {
        return new ProduitService(_produitRepo.Object, _notificationService.Object);
    }

    [Fact]
    public void GetAllProduits_ReturnsAllProduits()
    {
        var service = CreateService();
        var produits = new List<Produit>
        {
            new Produit { Id = 1, Nom = "Produit1", Actif = true },
            new Produit { Id = 2, Nom = "Produit2", Actif = false }
        };
        _produitRepo.Setup(x => x.GetAll()).Returns(produits);

        var result = service.GetAllProduits();

        Assert.Equal(2, result.Count);
        Assert.Equal("Produit1", result[0].Nom);
        Assert.Equal("Produit2", result[1].Nom);
    }

    [Fact]
    public void GetAllProduits_ProduitPerime_EnvoieNotification()
    {
        var service = CreateService();
        var produits = new List<Produit>
        {
            new Produit { Id = 1, Nom = "ProduitPerime", DatePeremption = DateTime.UtcNow.AddDays(-1) }
        };
        _produitRepo.Setup(x => x.GetAll()).Returns(produits);

        var result = service.GetAllProduits();

        _notificationService.Verify(x => x.EnvoyerNotification("Secretaire", It.Is<string>(msg => msg.Contains("ProduitPerime") && msg.Contains("péremption"))), Times.Once);
        Assert.Single(result);
    }

    [Fact]
    public void GetAllProduits_ProduitNonPerime_PasDeNotification()
    {
        var service = CreateService();
        var produits = new List<Produit>
        {
            new Produit { Id = 1, Nom = "ProduitValide", DatePeremption = DateTime.UtcNow.AddDays(30), Quantite = 10, SeuilAlerte = 5 }
        };
        _produitRepo.Setup(x => x.GetAll()).Returns(produits);

        var result = service.GetAllProduits();

        _notificationService.Verify(x => x.EnvoyerNotification(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        Assert.Single(result);
    }
}