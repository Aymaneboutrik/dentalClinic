using Microsoft.AspNetCore.Mvc;
using Service_Rendez_vous.DTOs;
using Service_Rendez_vous.Services.Interfaces;

namespace Service_Rendez_vous.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RendezVousController : ControllerBase
    {
        private readonly IRendezVousService _rendezVousService;

        public RendezVousController(IRendezVousService rendezVousService)
        {
            _rendezVousService = rendezVousService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RendezVousDto>>> GetAll()
        {
            var results = await _rendezVousService.GetAllAsync();
            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RendezVousDto>> GetById(int id)
        {
            var result = await _rendezVousService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<RendezVousDto>> Create([FromBody] CreateRendezVousDto dto)
        {
            var result = await _rendezVousService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<RendezVousDto>> Update(int id, [FromBody] UpdateRendezVousDto dto)
        {
            var result = await _rendezVousService.UpdateAsync(id, dto);
            return Ok(result);
        }

        [HttpPut("{id}/annuler")]
        public async Task<IActionResult> Cancel(int id, [FromQuery] string modifiePar)
        {
            await _rendezVousService.CancelAsync(id, modifiePar);
            return NoContent();
        }

        [HttpPut("{id}/absent")]
        public async Task<IActionResult> MarkAsAbsent(int id, [FromQuery] int modifiePar)
        {
            await _rendezVousService.MarkAsAbsentAsync(id, modifiePar);
            return NoContent();
        }

        [HttpPut("{id}/reporter")]
        public async Task<IActionResult> Reschedule(int id, [FromBody] RescheduleRendezVousDto dto)
        {
            await _rendezVousService.RescheduleAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id}/confirmer")]
        public async Task<IActionResult> Confirm(int id, [FromQuery] int modifiePar)
        {
            await _rendezVousService.ConfirmAsync(id, modifiePar);
            return NoContent();
        }

        [HttpPut("{id}/effectuer")]
        public async Task<IActionResult> MarkAsCompleted(int id, [FromQuery] int modifiePar)
        {
            await _rendezVousService.MarkAsCompletedAsync(id, modifiePar);
            return NoContent();
        }

        [HttpGet("{id}/historique")]
        public async Task<ActionResult<IEnumerable<HistoriqueRDVDto>>> GetHistory(int id)
        {
            var results = await _rendezVousService.GetHistoryAsync(id);
            return Ok(results);
        }

        [HttpGet("historique")]
        public async Task<ActionResult<IEnumerable<HistoriqueRDVDto>>> GetAllHistory()
        {
            var results = await _rendezVousService.GetAllHistoryAsync();
            return Ok(results);
        }
    }
}
