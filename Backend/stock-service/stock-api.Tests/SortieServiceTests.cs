using Xunit;
using Moq;
using StockApi.Services;
using StockApi.Repositories.Interfaces;
using StockApi.Models;
using StockApi.DTOs;
using StockApi.Enums;

public class SortieServiceTests
{
    private readonly Mock<IProduitRepository> _produitRepo = new();
    private readonly Mock<ISortieRepository> _sortieRepo = new();
    private readonly Mock<IMouvementStockRepository> _mouvementRepo = new();
    private readonly Mock<NotificationService> _notif = new();

    private SortieService CreateService()
    {
        return new SortieService(
            _produitRepo.Object,
            _sortieRepo.Object,
            _mouvementRepo.Object,
            _notif.Object
        );
    }

    [Fact]
    public void CreerSortie_ProduitInexistant_ReturnFalse()
    {
        // Arrange
        _produitRepo.Setup(x => x.GetById(It.IsAny<int>())).Returns((Produit)null);

        var service = CreateService();

        // Act
        var result = service.CreerSortie(
            new Sortie { ProduitId = 1, Quantite = 5 },
            out string message
        );

        // Assert
        Assert.False(result);

        // ✅ Message standardisé correspondant au test
        Assert.Equal("Produit introuvable", message);

        _sortieRepo.Verify(x => x.Add(It.IsAny<Sortie>()), Times.Never);
        _mouvementRepo.Verify(x => x.Add(It.IsAny<MouvementStock>()), Times.Never);
    }

    [Fact]
    public void CreerSortie_QuantiteDepasseStock_ReturnFalse()
    {
        // Arrange : produit avec 2 en stock
        _produitRepo.Setup(x => x.GetById(1))
            .Returns(new Produit { Id = 1, Quantite = 2 });

        var service = CreateService();

        // Act : on essaie de créer une sortie de 5
        var result = service.CreerSortie(
            new Sortie { ProduitId = 1, Quantite = 5 },
            out string message
        );

        // Assert : vérifie le résultat et le message exact
        Assert.False(result);
        Assert.Equal("Quantité sortie (5) dépasse la quantité disponible (2)", message);

        // Vérifie que rien n'a été ajouté aux repositories
        _sortieRepo.Verify(x => x.Add(It.IsAny<Sortie>()), Times.Never);
        _mouvementRepo.Verify(x => x.Add(It.IsAny<MouvementStock>()), Times.Never);
    }

    [Fact]
    public void CreerSortie_Valide_ReturnTrue()
    {
        _produitRepo.Setup(x => x.GetById(1))
            .Returns(new Produit { Id = 1, Quantite = 10, SeuilAlerte = 2 });

        var service = CreateService();

        var result = service.CreerSortie(
            new Sortie { ProduitId = 1, Quantite = 3 },
            out string message
        );

        Assert.True(result);

        // Vérifier les valeurs exactes des objets ajoutés
        _sortieRepo.Verify(x => x.Add(It.Is<Sortie>(s => s.ProduitId == 1 && s.Quantite == 3)), Times.Once);
        _mouvementRepo.Verify(x => x.Add(It.Is<MouvementStock>(m => m.ProduitId == 1 && m.Quantite == 3)), Times.Once);

        // Pas de notification (seuil non atteint)
        _notif.Verify(
            x => x.EnvoyerNotification(It.IsAny<string>(), It.IsAny<string>()),
            Times.Never
        );
    }

    [Fact]
    public void CreerSortie_DeclencheNotificationSeuil_ReturnTrue()
    {
        _produitRepo.Setup(x => x.GetById(1))
            .Returns(new Produit { Id = 1, Quantite = 5, SeuilAlerte = 3 });

        var service = CreateService();

        var result = service.CreerSortie(
            new Sortie { ProduitId = 1, Quantite = 3 },
            out _
        );

        Assert.True(result);

        // Vérifier les valeurs exactes des objets ajoutés
        _sortieRepo.Verify(x => x.Add(It.Is<Sortie>(s => s.ProduitId == 1 && s.Quantite == 3)), Times.Once);
        _mouvementRepo.Verify(x => x.Add(It.Is<MouvementStock>(m => m.ProduitId == 1 && m.Quantite == 3)), Times.Once);

        // Vérifier notification et contenu exact
        _notif.Verify(
            x => x.EnvoyerNotification(
                It.IsAny<string>(),
                It.Is<string>(msg => msg.Contains("Stock critique") || msg.Contains("seuil"))
            ),
            Times.Once
        );
    }

    [Fact]
    public void CreerSortie_QuantiteEgaleSeuil_DeclencheNotification()
    {
        // Arrange
        _produitRepo.Setup(x => x.GetById(1))
            .Returns(new Produit { Id = 1, Quantite = 3, SeuilAlerte = 3 });

        var service = CreateService();

        // Act
        var result = service.CreerSortie(
            new Sortie { ProduitId = 1, Quantite = 0 },
            out _
        );

        // Assert : la sortie est réussie
        Assert.True(result);

        // Vérifier que la notification a été envoyée, avec un message contenant "Stock critique" ou "seuil"
        _notif.Verify(
            x => x.EnvoyerNotification(
                It.IsAny<string>(),
                It.Is<string>(msg => msg.Contains("Stock critique") || msg.Contains("seuil"))
            ),
            Times.Once
        );
    }
}