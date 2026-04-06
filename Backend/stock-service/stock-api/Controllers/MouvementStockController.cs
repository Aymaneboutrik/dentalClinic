using Microsoft.AspNetCore.Mvc;
using StockApi.Models;
using StockApi.Services;
using StockApi.DTOs;
using StockApi.Mappers;

namespace StockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MouvementStockController : ControllerBase
    {
        private readonly MouvementStockService _service;

        public MouvementStockController(MouvementStockService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var mouvements = _service.GetAll();
            var dto = mouvements.Select(MouvementStockMapper.ToDto);
            return Ok(dto);
        }

        [HttpPut("{id}/modifier")]
        public IActionResult Modifier(int id, [FromBody] MouvementStockDto dto)
        {
            var success = _service.ModifierMouvement(id, dto.Quantite, dto.DateMouvement);
            if (!success) return BadRequest("Modification impossible pour ce mouvement");
            return Ok("Mouvement modifié avec succès");
        }
    }
}