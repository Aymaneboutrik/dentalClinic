using Microsoft.AspNetCore.Mvc;
using Service_Personnel.DTOS;
using Service_Personnel.Services.Interfaces.DemandeAbsence;

namespace Service_Personnel.Controllers
{
    [Route("api/demande-absence")]
    [ApiController]
    public class DemandeAbsenceController : ControllerBase
    {
        private readonly IDemandeAbsenceService _demandeAbsenceService;

        public DemandeAbsenceController(IDemandeAbsenceService demandeAbsenceService)
        {
            _demandeAbsenceService = demandeAbsenceService;
        }

        [HttpPost("{employeId}")]
        public async Task<IActionResult> Create(
            int employeId,
            [FromBody] CreateDemandeAbsenceDto dto,
            CancellationToken ct)
        {
            var result = await _demandeAbsenceService.CreateAsync(dto, employeId, ct);

            return Ok(result);
        }


        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var result = await _demandeAbsenceService.GetAllAsync(ct);
            return Ok(result);
        }

        [HttpGet("employe/{employeId}")]
        public async Task<IActionResult> GetByEmployeId(int employeId, CancellationToken ct)
        {
            var result = await _demandeAbsenceService.GetByEmployeIdAsync(employeId, ct);
            return Ok(result);
        }

        // Accepter une demande && Refuser une demande

        [HttpPut("{id}/accepter/{traiteParId}")]
        public async Task<IActionResult> Accepter(int id, int traiteParId, CancellationToken ct)
        {
            var result = await _demandeAbsenceService.AccepterAsync(id, traiteParId, ct);
            return Ok(result);
        }

        [HttpPut("{id}/refuser/{traiteParId}")]
        public async Task<IActionResult> Refuser(int id, int traiteParId, CancellationToken ct)
        {
            var result = await _demandeAbsenceService.RefuserAsync(id, traiteParId, ct);
            return Ok(result);
        }
    }
}