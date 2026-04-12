using Service_Personnel.DTOS.Absence;
using Service_Personnel.Exceptions;
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.Absences;
using Service_Personnel.Repositories.Interfaces.Employees;

namespace Service_Personnel.Services.Absences
{
    public class AbsenceService : IAbsenceService
    {
        private readonly IAbsenceRepository _absenceRepo;
        private readonly IEmployeeRepository _employeeRepo;

        public AbsenceService(
            IAbsenceRepository absenceRepo,
            IEmployeeRepository employeeRepo)
        {
            _absenceRepo = absenceRepo;
            _employeeRepo = employeeRepo;
        }

        public async Task<object> CreateAsync(CreateAbsenceRequestDto dto, CancellationToken ct = default)
        {
            // 1 — Vérifier que l'employé existe
            var employe = await _employeeRepo.GetByIdAsync(dto.EmployeId, ct);
            if (employe == null)
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

            // 2 — Convertir les dates
            var dateDebut = DateTime.SpecifyKind(dto.DateDebut, DateTimeKind.Utc);
            var dateFin = DateTime.SpecifyKind(dto.DateFin, DateTimeKind.Utc);

            // 3 — Vérification métier
            if (dateDebut > dateFin)
                throw new ApiException("La date de début doit être inférieure à la date de fin", 400, "INVALID_DATE_RANGE");

            // 4 — Création de l'absence
            var absence = new Absence
            {
                DateDebut = dateDebut,
                DateFin = dateFin,
                TypeAbsence = dto.TypeAbsence,
                DateValidation = DateTime.UtcNow,
                DemandeId = null,
                EmployeId = dto.EmployeId
            };

            // 5 — Sauvegarde
            await _absenceRepo.AddAsync(absence, ct);

            // 6 — Retour
            return new
            {
                Message = "Absence créée avec succès",
                IdAbsence = absence.IdAbsence,
                DateDebut = absence.DateDebut,
                DateFin = absence.DateFin,
                TypeAbsence = absence.TypeAbsence,
                DateValidation = absence.DateValidation,
                IdEmploye = absence.EmployeId,
                Nom = employe.Nom,
                Prenom = employe.Prenom
            };
        }

        public async Task<List<AbsenceResponseDto>> GetAllAsync(CancellationToken ct = default)
        {
            var absences = await _absenceRepo.GetAllWithEmployeAsync(ct);

            return absences.Select(a => new AbsenceResponseDto
            {
                IdAbsence = a.IdAbsence,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                TypeAbsence = a.TypeAbsence,
                DateValidation = a.DateValidation,
                DemandeId = a.DemandeId,
                EmployeId = a.EmployeId,
                Nom = a.Employe.Nom,
                Prenom = a.Employe.Prenom
            }).ToList();
        }

        public async Task<List<AbsenceResponseDto>> GetByEmployeIdAsync(int employeId, CancellationToken ct = default)
        {
            var employe = await _employeeRepo.GetByIdAsync(employeId, ct);
            if (employe == null)
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

            var absences = await _absenceRepo.GetByEmployeIdAsync(employeId, ct);

            return absences.Select(a => new AbsenceResponseDto
            {
                IdAbsence = a.IdAbsence,
                DateDebut = a.DateDebut,
                DateFin = a.DateFin,
                TypeAbsence = a.TypeAbsence,
                DateValidation = a.DateValidation,
                DemandeId = a.DemandeId,
                EmployeId = a.EmployeId,
                Nom = a.Employe.Nom,
                Prenom = a.Employe.Prenom
            }).ToList();
        }

        public async Task<object> DeleteAsync(int id, int docteurId, CancellationToken ct = default)
        {
            // 1 — vérifier docteur
            var docteur = await _employeeRepo.GetByIdWithRoleAsync(docteurId, ct);

            if (docteur == null)
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

            if (docteur.Role == null || docteur.Role.NomRole != "Docteur")
                throw new ApiException("Seul le docteur peut supprimer une absence", 403, "DOCTOR_ROLE_REQUIRED");

            // 2 — récupérer absence
            var absence = await _absenceRepo.GetByIdAsync(id, ct);

            if (absence == null)
                throw new ApiException("Absence introuvable", 404, "ABSENCE_NOT_FOUND");

            // 3 — suppression
            _absenceRepo.Delete(absence);
            await _absenceRepo.SaveChangesAsync(ct);

            // 4 — retour
            return new
            {
                Message = "Absence supprimée avec succès"
            };
        }
}
}