using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Service_Personnel.DTOS.Absence;
using Service_Personnel.Services.Absences;

namespace Service_Personnel.Controllers
{
    [Route("api/absence")]
    [ApiController]
    [Authorize(Roles = "Dentiste, Secretaire")]
    public class AbsenceController : ControllerBase
    {
        private readonly IAbsenceService _absenceService;

        public AbsenceController(IAbsenceService absenceService)
        {
            _absenceService = absenceService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAbsenceRequestDto dto, CancellationToken ct)
        {
            var result = await _absenceService.CreateAsync(dto, ct);
            return Ok(result);
        }

        //Get 
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var result = await _absenceService.GetAllAsync(ct);
            return Ok(result);
        }

        //GetBy ID EMPLOYE
        [HttpGet("employe/{employeId}")]
        public async Task<IActionResult> GetByEmployeId(int employeId, CancellationToken ct)
        {
            var result = await _absenceService.GetByEmployeIdAsync(employeId, ct);
            return Ok(result);
        }

        [HttpDelete("{id}/{docteurId}")]
        public async Task<IActionResult> Delete(int id, int docteurId, CancellationToken ct)
        {
            var result = await _absenceService.DeleteAsync(id, docteurId, ct);
            return Ok(result);
        }

    }
}