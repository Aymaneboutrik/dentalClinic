using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockApi.DTOs;
using StockApi.Mappers;
using StockApi.Repositories.Interfaces;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Dentiste, Secretaire")]
    public class FournisseurController : ControllerBase
    {
        private readonly IFournisseurRepository _fournisseurRepository;

        public FournisseurController(IFournisseurRepository fournisseurRepository)
        {
            _fournisseurRepository = fournisseurRepository;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var fournisseurs = _fournisseurRepository.GetAll();
            var dto = fournisseurs.Select(FournisseurMapper.ToDto);
            return Ok(dto);
        }

        [HttpPost]
        public IActionResult Create(FournisseurDto dto)
        {
            var fournisseur = FournisseurMapper.ToEntity(dto);

            _fournisseurRepository.Add(fournisseur);
            _fournisseurRepository.Save();

            return Ok(FournisseurMapper.ToDto(fournisseur));
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, FournisseurDto dto)
        {
            var fournisseur = _fournisseurRepository.GetById(id);

            if (fournisseur == null)
                return NotFound("Fournisseur introuvable");

            fournisseur.Nom = dto.Nom;
            fournisseur.Adresse = dto.Adresse;
            fournisseur.Telephone = dto.Telephone;

            _fournisseurRepository.Update(fournisseur);
            _fournisseurRepository.Save();

            return Ok(FournisseurMapper.ToDto(fournisseur));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var fournisseur = _fournisseurRepository.GetById(id);

            if (fournisseur == null)
                return NotFound("Fournisseur introuvable");

            _fournisseurRepository.Delete(fournisseur);
            _fournisseurRepository.Save();

            return Ok("Fournisseur supprimé");
        }
    }
}