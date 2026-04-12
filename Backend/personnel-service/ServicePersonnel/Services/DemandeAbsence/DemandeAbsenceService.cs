using Service_Personnel.DTOS;
using Service_Personnel.DTOS.DemandeAbsence;
using Service_Personnel.Exceptions;
using Service_Personnel.Models;
using Service_Personnel.Repositories.Interfaces.Absences;
using Service_Personnel.Repositories.Interfaces.DemandesAbsence;
using Service_Personnel.Repositories.Interfaces.Employees;
using Service_Personnel.Services.Interfaces.DemandeAbsence;

namespace Service_Personnel.Services.DemandeAbsence
{
    public class DemandeAbsenceService : IDemandeAbsenceService
    {
        private readonly IDemandeAbsenceRepository _demandeRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IAbsenceRepository _absenceRepo;

        public DemandeAbsenceService(
            IDemandeAbsenceRepository demandeRepo,
            IEmployeeRepository employeeRepo,
            IAbsenceRepository absenceRepo)
        {
            _demandeRepo = demandeRepo;
            _employeeRepo = employeeRepo;
            _absenceRepo = absenceRepo;

        }

        public async Task<object> CreateAsync(CreateDemandeAbsenceDto dto, int employeId, CancellationToken ct = default)
        {
            // 1 — Vérifier que l’employé existe
            var employe = await _employeeRepo.GetByIdAsync(employeId, ct);
            if (employe == null)
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

            

            // 3 — Vérifier date début >= aujourd’hui
            if (DateTime.SpecifyKind(dto.DateDebut, DateTimeKind.Utc) < DateTime.UtcNow)
                throw new ApiException("La date de début ne peut pas être dans le passé", 400, "INVALID_START_DATE");

            // 2 — Vérification métier : DateDebut < DateFin
            if (dto.DateDebut >= dto.DateFin)
                throw new ApiException("La date de début doit être inférieure à la date de fin", 400, "INVALID_DATE_RANGE");

            // 4 — Création de la demande
            var demande = new Models.DemandeAbsence
            {
                DateCreation = DateTime.UtcNow,
                DateDebut = DateTime.SpecifyKind(dto.DateDebut, DateTimeKind.Utc),
                DateFin = DateTime.SpecifyKind(dto.DateFin, DateTimeKind.Utc),
                TypeDemande = dto.TypeDemande,
                Motif = dto.Motif,
                Statut = "EN_ATTENTE",
                DateTraitement = null,
                EmployeId = employeId,
                TraiteParId = null
            };
            // 5 — Sauvegarde
            await _demandeRepo.AddAsync(demande, ct);

            // 6 — Retour structuré (même style que Horaire)
            return new
            {
                Message = "Demande d'absence créée avec succès",
                IdDemande = demande.IdDemande,
                DateCreation = demande.DateCreation,
                DateDebut = demande.DateDebut,
                DateFin = demande.DateFin,
                TypeDemande = demande.TypeDemande,
                Motif = demande.Motif,
                Statut = demande.Statut,
                IdEmploye = demande.EmployeId,

                Nom = employe.Nom,
                Prenom = employe.Prenom
            };
        }


            //GetAll

             public async Task<List<DemandeAbsenceResponseDto>> GetAllAsync(CancellationToken ct = default)
        {
            var demandes = await _demandeRepo.GetAllWithEmployeAsync(ct);

            return demandes.Select(d => new DemandeAbsenceResponseDto
            {
                IdDemande = d.IdDemande,
                DateCreation = d.DateCreation,
                DateDebut = d.DateDebut,
                DateFin = d.DateFin,
                TypeDemande = d.TypeDemande,
                Motif = d.Motif,
                Statut = d.Statut,
                DateTraitement = d.DateTraitement,
                IdEmploye = d.EmployeId,
                Nom = d.Employe.Nom,
                Prenom = d.Employe.Prenom
            }).ToList();
        }

        //gETBYID 
        public async Task<List<DemandeAbsenceResponseDto>> GetByEmployeIdAsync(int employeId, CancellationToken ct = default)
        {
            var employe = await _employeeRepo.GetByIdAsync(employeId, ct);
            if (employe == null)
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

            var demandes = await _demandeRepo.GetByEmployeIdAsync(employeId, ct);

            return demandes.Select(d => new DemandeAbsenceResponseDto
            {
                IdDemande = d.IdDemande,
                DateCreation = d.DateCreation,
                DateDebut = d.DateDebut,
                DateFin = d.DateFin,
                TypeDemande = d.TypeDemande,
                Motif = d.Motif,
                Statut = d.Statut,
                DateTraitement = d.DateTraitement,
                IdEmploye = d.EmployeId,
                Nom = d.Employe.Nom,
                Prenom = d.Employe.Prenom
            }).ToList();
        }


        public async Task<object> AccepterAsync(int demandeId, int traiteParId, CancellationToken ct = default)
{
    var traiteur = await _employeeRepo.GetByIdWithRoleAsync(traiteParId, ct);

    if (traiteur == null)
        throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

    if (
        traiteur.Role == null ||
        !string.Equals(traiteur.Role.NomRole?.Trim(), "Docteur", StringComparison.OrdinalIgnoreCase)
    )
        throw new ApiException("Seul le docteur peut traiter une demande", 403, "DOCTOR_ROLE_REQUIRED");

    var demande = await _demandeRepo.GetByIdAsync(demandeId, ct);
    if (demande == null)
        throw new ApiException("Demande introuvable", 404, "DEMANDE_NOT_FOUND");

    if (demande.Statut != "EN_ATTENTE")
        throw new ApiException("Demande déjà traitée", 400, "DEMANDE_ALREADY_PROCESSED");

    demande.Statut = "ACCEPTEE";
    demande.DateTraitement = DateTime.UtcNow;
    demande.TraiteParId = traiteParId;

    var absence = new Absence
    {
        DateDebut = DateTime.SpecifyKind(demande.DateDebut, DateTimeKind.Utc),
        DateFin = DateTime.SpecifyKind(demande.DateFin, DateTimeKind.Utc),
        TypeAbsence = demande.TypeDemande,
        DateValidation = DateTime.UtcNow,
        DemandeId = demande.IdDemande,
        EmployeId = demande.EmployeId
    };

    await _absenceRepo.AddAsync(absence, ct);
    await _demandeRepo.SaveChangesAsync(ct);

    return new
    {
        Message = "Demande acceptée et absence créée"
    };
}

public async Task<object> RefuserAsync(int demandeId, int traiteParId, CancellationToken ct = default)
{
    var traiteur = await _employeeRepo.GetByIdWithRoleAsync(traiteParId, ct);

    if (traiteur == null)
        throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

    if (
        traiteur.Role == null ||
        !string.Equals(traiteur.Role.NomRole?.Trim(), "Docteur", StringComparison.OrdinalIgnoreCase)
    )
        throw new ApiException("Seul le docteur peut traiter une demande", 403, "DOCTOR_ROLE_REQUIRED");

    var demande = await _demandeRepo.GetByIdAsync(demandeId, ct);

    if (demande == null)
        throw new ApiException("Demande introuvable", 404, "DEMANDE_NOT_FOUND");

    if (demande.Statut != "EN_ATTENTE")
        throw new ApiException("Demande déjà traitée", 400, "DEMANDE_ALREADY_PROCESSED");

    demande.Statut = "REFUSEE";
    demande.DateTraitement = DateTime.UtcNow;
    demande.TraiteParId = traiteParId;

    await _demandeRepo.SaveChangesAsync(ct);

    return new
    {
        Message = "Demande refusée"
    };
}
    }}

    
