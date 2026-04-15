using Microsoft.AspNetCore.Mvc;
using StockApi.DTOs;
using StockApi.Models;
using StockApi.Services;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SortieController : ControllerBase
    {
        private readonly SortieService _sortieService;

        public SortieController(SortieService sortieService)
        {
            _sortieService = sortieService;
        }

        [HttpPost]
        public IActionResult CreerSortie(SortieDto dto)
        {
            var sortie = new Sortie
            {
                DateSortie = dto.DateSortie,
                ProduitId = dto.ProduitId,
                Quantite = dto.Quantite
            };

            if (_sortieService.CreerSortie(sortie, out string message))
            {
                return Ok(message);
            }

            return BadRequest(message);
        }
    }
}