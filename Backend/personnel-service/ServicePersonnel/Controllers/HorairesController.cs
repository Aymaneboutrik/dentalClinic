using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service_Personnel.DTOS.Horaires;
using Service_Personnel.Services.Horaires;

namespace Service_Personnel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HorairesController : ControllerBase
    {
        private readonly IHoraireService _horaireService;

        public HorairesController(IHoraireService horaireService)
        {
            _horaireService = horaireService;// Injection de dépendance du service dans le constructeur
        }

        //  POST : api/horaires
        [HttpPost]
        [Authorize(Roles = "Dentiste, Secretaire")]
        public async Task<IActionResult> Create(CreateHoraireRequestDto dto, CancellationToken ct)
        {
            var result = await _horaireService.CreateAsync(dto, ct);

            return Ok(result);
        }

        //Patch 
        [HttpPatch("{id}")]
        [Authorize(Roles = "Dentiste, Secretaire")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateHoraireRequestDto dto, CancellationToken ct)
        {
            object result = await _horaireService.UpdateAsync(id, dto, ct);
            return Ok(result);
        }


        //Get all   
        [HttpGet]
        [Authorize(Roles = "Dentiste, Secretaire, Assistante")]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var result = await _horaireService.GetAllAsync(ct);
            return Ok(result);
        }

        //Delete horaire  

        [HttpDelete("{id}")]
        [Authorize(Roles = "Dentiste, Secretaire")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            var result = await _horaireService.DeleteAsync(id, ct);
            return Ok(result);
        }
    }
}