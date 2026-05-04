using Service_Personnel.DTOS.Horaires;
using Service_Personnel.Exceptions;
using Service_Personnel.Mappers.Horaires;
using Service_Personnel.Models;
using Service_Personnel.Repositories.Horaires;
using Service_Personnel.Repositories.Interfaces.Employees;
using Service_Personnel.Repositories.Interfaces.Horaires;

namespace Service_Personnel.Services.Horaires
{
    public class HoraireService : IHoraireService
    {
        private readonly IHoraireRepository _horaireRepo;
        private readonly IEmployeeRepository _employeeRepo;

        public HoraireService(
            IHoraireRepository horaireRepo,
            IEmployeeRepository employeeRepo   )
        {
            _horaireRepo = horaireRepo;
            _employeeRepo = employeeRepo;
        }

        public async Task<object> CreateAsync(CreateHoraireRequestDto dto, CancellationToken ct = default)
        {
            // 1 — Vérifier que l’employé existe
            var employe = await _employeeRepo.GetByIdAsync(dto.IdEmploye, ct);
            if (employe == null)
                throw new ApiException("Employé introuvable", 404, "EMPLOYEE_NOT_FOUND");

            // 2 — Vérification métier : HeureDebut < HeureFin
            if (dto.HeureDebut!.Value >= dto.HeureFin!.Value)
                throw new ApiException("L'heure de début doit être inférieure à l'heure de fin", 400, "INVALID_TIME");

            // 3 — Mapping DTO → Entity
            var horaire = HoraireMapper.ToEntity(dto);

            //////////////// 
            bool overlap = await _horaireRepo.ExistsOverlapAsync(
                    horaire.IdEmploye,
                    horaire.Jour,
                    horaire.HeureDebut,
                    horaire.HeureFin,
                    null, // important pour CREATE
                    ct
                );

            if (overlap)
            {
                throw new ApiException("Conflit d'horaire pour cet employé", 400, "HORAIRE_CONFLICT");
            }

            // 4 — Ajout en base
            await _horaireRepo.AddAsync(horaire);

            // (si tu utilises SaveChanges séparé comme Employe, adapte ici)
            // sinon si AddAsync sauvegarde déjà, c'est bon

            // 5 — Retour info horaire + nom/prenom/role de l'employé   
            var result = await _horaireRepo.GetByIdWithEmployeAsync(horaire.IdHoraire, ct);

            return new
            {
                Message = "Horaire créé avec succès",
                Jour = result!.Jour,
                HeureDebut = result.HeureDebut,
                HeureFin = result.HeureFin,
                IdEmploye = result.IdEmploye,

                Nom = result.Employe.Nom,
                Prenom = result.Employe.Prenom,
                Role = result.Employe.Role.NomRole
            };
        }

        public async Task<object> UpdateAsync(int id, UpdateHoraireRequestDto dto, CancellationToken ct = default)
        {
            // 1. Récupérer l'horaire existant
            var horaire = await _horaireRepo.GetByIdAsync(id);

            // 2. Vérifier s'il existe
            if (horaire == null)
                throw new ApiException("Horaire introuvable", 404, "HORAIRE_NOT_FOUND");

            // 3. Appliquer seulement les champs envoyés
            if (dto.Jour.HasValue)
                horaire.Jour = dto.Jour.Value;

            if (dto.HeureDebut.HasValue)
                horaire.HeureDebut = TimeOnly.FromTimeSpan(dto.HeureDebut.Value);

            if (dto.HeureFin.HasValue)
                horaire.HeureFin = TimeOnly.FromTimeSpan(dto.HeureFin.Value);

            // 4. Vérification métier après patch
            if (horaire.HeureDebut >= horaire.HeureFin)
                throw new ApiException("L'heure de début doit être inférieure à l'heure de fin", 400, "INVALID_HORAIRE");

            


            //Verification des complis d erreure pour un employer 
            bool overlap = await _horaireRepo.ExistsOverlapAsync(

               horaire.IdEmploye,
               horaire.Jour,
               horaire.HeureDebut,
               horaire.HeureFin,
               horaire.IdHoraire,
               ct
);

            if (overlap)
            {
                throw new ApiException("Conflit d'horaire pour cet employé", 400, "HORAIRE_CONFLICT");
            }

            // 5. Sauvegarder
            await _horaireRepo.SaveChangesAsync();

            // 6. Retour
            var result = await _horaireRepo.GetByIdWithEmployeAsync(horaire.IdHoraire, ct);

            return new
            {
                Message = "Horaire modifié avec succès",
                Jour = result!.Jour,
                HeureDebut = result.HeureDebut,
                HeureFin = result.HeureFin,
                IdEmploye = result.IdEmploye,

                Nom = result.Employe.Nom,
                Prenom = result.Employe.Prenom,
                Role = result.Employe.Role.NomRole
            };


        }

        //Get All Horaires + nom prenom role de l'employe
        public async Task<List<HoraireResponseDto>> GetAllAsync(CancellationToken ct = default)
        {
            var horaires = await _horaireRepo.GetAllWithEmployeAsync(ct);

            return horaires.Select(h => new HoraireResponseDto
            {
                IdHoraire = h.IdHoraire,
                Jour = h.Jour.ToString(),
                HeureDebut = h.HeureDebut,
                HeureFin = h.HeureFin,
                IdEmploye = h.IdEmploye,
                Nom = h.Employe.Nom,
                Prenom = h.Employe.Prenom,
                Role = h.Employe.Role.NomRole
            }).ToList();
        }


        //Delete

        public async Task<object> DeleteAsync(int id, CancellationToken ct = default)
        {
            var horaire = await _horaireRepo.GetByIdAsync(id);

            if (horaire == null)
                throw new ApiException("Horaire introuvable", 404, "HORAIRE_NOT_FOUND");

            _horaireRepo.Delete(horaire);

            await _horaireRepo.SaveChangesAsync();

            return new
            {
                Message = "Horaire supprimé avec succès"
            };
        }
    }
}