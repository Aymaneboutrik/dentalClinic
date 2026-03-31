using Xunit;
using Moq;
using StockApi.Services;
using StockApi.Repositories.Interfaces;
using StockApi.Models;
using StockApi.DTOs;
using StockApi.Enums;

public class ProduitServiceTests
{
    private readonly Mock<IProduitRepository> _produitRepo = new();
    private readonly Mock<IMouvementStockRepository> _mouvRepo = new();

    private ProduitService CreateService()
    {
        return new ProduitService(_produitRepo.Object, _mouvRepo.Object);
    }

    [Fact]
    public void CreerDepuisLigneCommande_CreeProduitEtMouvement_DonneesCorrectes()
    {
        var service = CreateService();

        var ligne = new LigneCommande
        {
            Nom = "ProduitTest",
            Quantite = 5
        };

        var dto = new ProduitDto
        {
            Description = "Desc",
            SeuilAlerte = 2
        };

        var result = service.CreerDepuisLigneCommande(ligne, dto);

        // Vérifier le produit exact ajouté
        _produitRepo.Verify(x => x.Add(It.Is<Produit>(p =>
            p.Nom == "ProduitTest" &&
            p.Quantite == 5 &&
            p.Description == "Desc" &&
            p.SeuilAlerte == 2
        )), Times.Once);

        // Vérifier le mouvement exact ajouté
        _mouvRepo.Verify(x => x.Add(It.Is<MouvementStock>(m =>
            m.TypeMouvement == TypeMouvement.Entree &&
            m.Quantite == 5 &&
            m.ProduitId == result.Id
        )), Times.Once);

        Assert.Equal("ProduitTest", result.Nom);
        Assert.Equal(5, result.Quantite);
        Assert.Equal("Desc", result.Description);
        Assert.Equal(2, result.SeuilAlerte);
    }

    [Fact]
    public void CreerDepuisLigneCommande_QuantiteInferieureSeuil_DeclencheNotification()
    {
        var service = CreateService();

        var ligne = new LigneCommande
        {
            Nom = "ProduitCritique",
            Quantite = 1
        };

        var dto = new ProduitDto
        {
            Description = "DescCritique",
            SeuilAlerte = 5
        };

        var result = service.CreerDepuisLigneCommande(ligne, dto);

        // Vérifier création produit exact
        _produitRepo.Verify(x => x.Add(It.Is<Produit>(p =>
            p.Nom == "ProduitCritique" &&
            p.Quantite == 1 &&
            p.Description == "DescCritique" &&
            p.SeuilAlerte == 5
        )), Times.Once);

        // Vérifier le mouvement exact ajouté
        _mouvRepo.Verify(x => x.Add(It.Is<MouvementStock>(m =>
            m.TypeMouvement == TypeMouvement.Entree &&
            m.Quantite == 1 &&
            m.ProduitId == result.Id
        )), Times.Once);
    }
}