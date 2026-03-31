using Xunit;
using Moq;
using StockApi.Services;
using StockApi.Repositories.Interfaces;
using StockApi.Models;
using StockApi.DTOs;
using StockApi.Enums;

public class MouvementStockServiceTests
{
    private readonly Mock<IMouvementStockRepository> _mouvRepo = new();
    private readonly Mock<IProduitRepository> _prodRepo = new();
    private readonly Mock<ISortieRepository> _sortieRepo = new();

    [Fact]
    public void ModifierMouvement_Entree_Valide_ReturnTrue()
    {
        // Arrange : mouvement existant de type Entrée avec 5
        var mouvement = new MouvementStock
        {
            Id = 1,
            TypeMouvement = TypeMouvement.Entree,
            Quantite = 5,
            ProduitId = 1,
            DateMouvement = DateTime.Today
        };

        _mouvRepo.Setup(x => x.GetById(1)).Returns(mouvement);

        var service = new MouvementStockService(
            _mouvRepo.Object,
            _prodRepo.Object,
            _sortieRepo.Object
        );

        // Act : on modifie uniquement la date
        var nouvelleDate = DateTime.Today.AddDays(1);
        var result = service.ModifierMouvement(1, nouvelleDate: nouvelleDate);

        // Assert : vérifie que la modification a réussi
        Assert.True(result);

        // Vérifier que la mise à jour du mouvement a été effectuée
        _mouvRepo.Verify(x => x.Update(It.IsAny<MouvementStock>()), Times.Once);
        _mouvRepo.Verify(x => x.Save(), Times.Once);

        // Vérifie que le produit et la sortie n’ont pas été touchés
        _prodRepo.Verify(x => x.GetById(It.IsAny<int>()), Times.Never);
        _sortieRepo.Verify(x => x.GetByProduitId(It.IsAny<int>()), Times.Never);

        // Vérifier que seule la date a changé
        Assert.Equal(nouvelleDate, mouvement.DateMouvement);
        Assert.Equal(5, mouvement.Quantite); // Quantité inchangée
    }

    [Fact]
    public void ModifierMouvement_Sortie_Valide_ReturnTrue()
    {
        var mouvement = new MouvementStock
        {
            Id = 1,
            TypeMouvement = TypeMouvement.Sortie,
            Quantite = 5,
            ProduitId = 1
        };

        var produit = new Produit
        {
            Id = 1,
            Quantite = 2
        };

        _mouvRepo.Setup(x => x.GetById(1)).Returns(mouvement);
        _prodRepo.Setup(x => x.GetById(1)).Returns(produit);

        var service = new MouvementStockService(
            _mouvRepo.Object,
            _prodRepo.Object,
            _sortieRepo.Object
        );

        var result = service.ModifierMouvement(1, 8);

        Assert.True(result);

        _mouvRepo.Verify(x => x.Update(It.IsAny<MouvementStock>()), Times.Once);
        _prodRepo.Verify(x => x.GetById(It.IsAny<int>()), Times.Once);
        _sortieRepo.Verify(x => x.GetByProduitId(It.IsAny<int>()), Times.Once);
        _mouvRepo.Verify(x => x.Save(), Times.Once);

        // 🔥 Vérifier que la quantité du produit n'est pas négative
        Assert.True(produit.Quantite >= 0);
        // Vérifier que la quantité du mouvement a bien été mise à jour
        Assert.Equal(8, mouvement.Quantite);
    }

    [Fact]
    public void ModifierMouvement_NotFound_ReturnFalse()
    {
        _mouvRepo.Setup(x => x.GetById(1)).Returns((MouvementStock)null);

        var service = new MouvementStockService(
            _mouvRepo.Object,
            _prodRepo.Object,
            _sortieRepo.Object
        );

        var result = service.ModifierMouvement(1, 5);

        Assert.False(result);

        // Vérifier qu'aucune mise à jour n'a été faite
        _mouvRepo.Verify(x => x.Update(It.IsAny<MouvementStock>()), Times.Never);
        _prodRepo.Verify(x => x.GetById(It.IsAny<int>()), Times.Never);
        _sortieRepo.Verify(x => x.GetByProduitId(It.IsAny<int>()), Times.Never);
        _mouvRepo.Verify(x => x.Save(), Times.Never);
    }
}