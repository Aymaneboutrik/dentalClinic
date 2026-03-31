using Microsoft.AspNetCore.Mvc;
using Service_Personnel.DTOS.Employes;
using Service_Personnel.Services.Employees;

namespace Service_Personnel.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _service;
        public EmployeesController(IEmployeeService service)
        {
            _service = service;
        }
        [HttpPost]
        public async Task<IActionResult> Create(CreateEmployeeRequestDto dto, CancellationToken ct)
        {
            // ✅ Si DTO invalide → 400 (validation DataAnnotations)
            // Note: avec [ApiController], ASP.NET peut déjà renvoyer 400 automatiquement,
            // mais on peut garder ce check si tu veux un format personnalisé.
            if (!ModelState.IsValid)
                return BadRequest(new
                {
                    message = "Données invalides",
                    errors = ModelState
                });

            // ✅ Pas de try/catch ici
            // Les erreurs métier (ApiException) seront gérées par le middleware global
            var result = await _service.CreateAsync(dto, ct);

            // ✅ Succès → 201 + infos employé
            return StatusCode(201, new
            {
                message = "Employé ajouté avec succès", // il fabrique la reponse 
                data = result
            });
        }

        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeRequestDto dto, CancellationToken ct)
        {
            var result = await _service.UpdateAsync(id, dto, ct);
            return Ok(result);
        }


        //Get  employer 

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var result = await _service.GetAllAsync(ct);
            return Ok(result);
        }

        //GetById

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct)
        {
            var result = await _service.GetByIdAsync(id, ct);
            return Ok(result);
        }
        //Delet employé

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken ct)
        {
            // Appelle le service pour supprimer l'employé
            await _service.DeleteAsync(id, ct);

            // Retourne 204 No Content si la suppression a réussi
            return Ok();
        }
    }
}