using Microsoft.AspNetCore.Mvc;
using StockApi.DTOs;
using StockApi.Mappers;
using StockApi.Repositories.Interfaces;
using StockApi.Services;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProduitController : ControllerBase
    {
        private readonly IProduitRepository _produitRepository;
        private readonly ProduitService _produitService;

        public ProduitController(
            IProduitRepository produitRepository,
            ProduitService produitService)
        {
            _produitRepository = produitRepository;
            _produitService = produitService;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var produits = _produitService.GetAllProduits();
            var dto = produits.Select(ProduitMapper.ToDto);
            return Ok(dto);
        }

        [HttpPost]
        public IActionResult Create(ProduitDto dto)
        {
            var produit = ProduitMapper.ToEntity(dto);

            _produitRepository.Add(produit);
            _produitRepository.Save();

            return Ok(ProduitMapper.ToDto(produit));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, ProduitDto dto)
        {
            var produit = _produitRepository.GetById(id);

            if (produit == null)
                return NotFound("Produit introuvable");

            produit.Nom = dto.Nom;
            produit.Quantite = dto.Quantite;
            produit.Description = dto.Description;
            produit.SeuilAlerte = dto.SeuilAlerte;
            produit.DatePeremption = dto.DatePeremption;

            _produitRepository.Update(produit);
            _produitRepository.Save();

            return Ok(ProduitMapper.ToDto(produit));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var produit = _produitRepository.GetById(id);

            if (produit == null)
                return NotFound("Produit introuvable");

            _produitRepository.Delete(produit);
            _produitRepository.Save();

            return Ok("Produit supprimé");
        }
    }
}