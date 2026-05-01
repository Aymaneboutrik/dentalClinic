using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Service_Rendez_vous.DTOs;
using Service_Rendez_vous.Enums;
using Service_Rendez_vous.Exceptions;
using Service_Rendez_vous.Mappers;
using Service_Rendez_vous.Models;
using Service_Rendez_vous.Repositories.Interfaces;
using Service_Rendez_vous.Services.Interfaces;
using Service_Rendez_vous.Extensions;

namespace Service_Rendez_vous.Services
{
    public class RendezVousService : IRendezVousService
    {
        private readonly IRendezVousRepository _rendezVousRepository;

        public RendezVousService(IRendezVousRepository rendezVousRepository)
        {
            _rendezVousRepository = rendezVousRepository;
        }

        public async Task<IEnumerable<RendezVousDto>> GetAllAsync()
        {
            var rdvList = await _rendezVousRepository.GetAllAsync();
            return rdvList.Select(r => RendezVousMapper.ToDto(r));
        }

        public async Task<RendezVousDto> GetByIdAsync(int id)
        {
            var rdv = await _rendezVousRepository.GetByIdAsync(id);
            if (rdv == null) throw new RendezVousNotFoundException(id);
            return RendezVousMapper.ToDto(rdv);
        }

        public async Task<RendezVousDto> CreateAsync(CreateRendezVousDto dto)
        {
            // Validation manuelle
            if (dto.Date < DateOnly.FromDateTime(DateTime.UtcNow))
                throw new BusinessRuleException("La date du rendez-vous ne peut pas être dans le passé.");
            if (dto.HeureDebut >= dto.HeureFinPrevue)
                throw new BusinessRuleException("L'heure de début doit être avant l'heure de fin prévue.");

            var rdv = new RendezVous
            {
                PatientId = dto.PatientId,
                DentisteId = dto.DentisteId,
                Date = dto.Date,
                HeureDebut = dto.HeureDebut,
                Motif = dto.Motif,
                HeureFinPrevue = dto.HeureFinPrevue,
                EstUrgent = dto.EstUrgent,
                StatutId = 1 // En attente / Programmé par défaut
            };

            var createdRdv = await _rendezVousRepository.AddAsync(rdv);

            // Historique
            await _rendezVousRepository.AddHistoriqueAsync(new HistoriqueRDV
            {
                RendezVousId = createdRdv.Id,
                AncienStatut = "N/A",
                NouveauStatut = "Programmé",
                DateModification = DateTime.UtcNow.ToPostgresTimestamp(),
                ModifiePar = "Secrétaire", // Secretary defaults for Create
                TypeModification = TypeModificationEnum.Creation.ToString(),
                PatientId = createdRdv.PatientId,
                DentisteId = createdRdv.DentisteId,
                Date = createdRdv.Date,
                HeureDebut = createdRdv.HeureDebut,
                Motif = createdRdv.Motif,
                EstUrgent = createdRdv.EstUrgent
            });

            return RendezVousMapper.ToDto(createdRdv);
        }

        public async Task<RendezVousDto> UpdateAsync(int id, UpdateRendezVousDto dto)
        {
            var rdv = await _rendezVousRepository.GetByIdAsync(id);
            if (rdv == null) throw new RendezVousNotFoundException(id);

            // Validation manuelle
            if (dto.Date < DateOnly.FromDateTime(DateTime.UtcNow))
                throw new BusinessRuleException("La date du rendez-vous ne peut pas être dans le passé.");
            if (dto.HeureDebut >= dto.HeureFinPrevue)
                throw new BusinessRuleException("L'heure de début doit être avant l'heure de fin prévue.");

            // On trace l'ancien statut pour l'historique
            string ancienStatut = rdv.StatutId.ToString();

            rdv.Date = dto.Date;
            rdv.HeureDebut = dto.HeureDebut;
            rdv.Motif = dto.Motif;
            rdv.HeureFinPrevue = dto.HeureFinPrevue;
            rdv.EstUrgent = dto.EstUrgent;

            await _rendezVousRepository.UpdateAsync(rdv);

            // Historique
            await _rendezVousRepository.AddHistoriqueAsync(new HistoriqueRDV
            {
                RendezVousId = rdv.Id,
                AncienStatut = ancienStatut,
                NouveauStatut = rdv.StatutId.ToString(),
                DateModification = DateTime.UtcNow.ToPostgresTimestamp(),
                ModifiePar = "Secrétaire",
                TypeModification = TypeModificationEnum.ModificationStatut.ToString(),
                PatientId = rdv.PatientId,
                DentisteId = rdv.DentisteId,
                Date = rdv.Date,
                HeureDebut = rdv.HeureDebut,
                Motif = rdv.Motif,
                EstUrgent = rdv.EstUrgent
            });

            return RendezVousMapper.ToDto(rdv);
        }

        public async Task CancelAsync(int id, string modifiePar)
        {
            var rdv = await _rendezVousRepository.GetByIdAsync(id);
            if (rdv == null) throw new RendezVousNotFoundException(id);

            string ancienStatut = rdv.StatutId.ToString();
            rdv.StatutId = 3; // Annulé

            await _rendezVousRepository.UpdateAsync(rdv);

            // Historique
            await _rendezVousRepository.AddHistoriqueAsync(new HistoriqueRDV
            {
                RendezVousId = rdv.Id,
                AncienStatut = ancienStatut,
                NouveauStatut = "Annulé",
                DateModification = DateTime.UtcNow.ToPostgresTimestamp(),
                ModifiePar = modifiePar,
                TypeModification = TypeModificationEnum.Annulation.ToString(),
                PatientId = rdv.PatientId,
                DentisteId = rdv.DentisteId,
                Date = rdv.Date,
                HeureDebut = rdv.HeureDebut,
                Motif = rdv.Motif,
                EstUrgent = rdv.EstUrgent
            });

            await _rendezVousRepository.DeleteAsync(rdv.Id);
        }

        public async Task MarkAsAbsentAsync(int id, int modifiePar)
        {
            var rdv = await _rendezVousRepository.GetByIdAsync(id);
            if (rdv == null) throw new RendezVousNotFoundException(id);

            string ancienStatut = rdv.StatutId.ToString();
            rdv.StatutId = 5; // Absent

            await _rendezVousRepository.UpdateAsync(rdv);

            await _rendezVousRepository.AddHistoriqueAsync(new HistoriqueRDV
            {
                RendezVousId = rdv.Id,
                AncienStatut = ancienStatut,
                NouveauStatut = "Absent",
                DateModification = DateTime.UtcNow.ToPostgresTimestamp(),
                ModifiePar = modifiePar.ToString(),
                TypeModification = TypeModificationEnum.Absence.ToString(),
                PatientId = rdv.PatientId,
                DentisteId = rdv.DentisteId,
                Date = rdv.Date,
                HeureDebut = rdv.HeureDebut,
                Motif = rdv.Motif,
                EstUrgent = rdv.EstUrgent
            });

            await _rendezVousRepository.DeleteAsync(rdv.Id);
        }

        public async Task RescheduleAsync(int id, RescheduleRendezVousDto dto)
        {
            try
            {
                if (dto == null)
                    throw new BusinessRuleException("Les données de report sont obligatoires.");

                if (string.IsNullOrWhiteSpace(dto.Date) || 
                    string.IsNullOrWhiteSpace(dto.HeureDebut) || 
                    string.IsNullOrWhiteSpace(dto.HeureFinPrevue))
                    throw new BusinessRuleException("La date, l'heure de début et l'heure de fin prévue sont obligatoires.");

                if (!DateOnly.TryParse(dto.Date, out DateOnly parsedDate))
                    throw new BusinessRuleException("Format de date invalide. Utilisez AAAA-MM-JJ.");

                if (!TimeSpan.TryParse(dto.HeureDebut, out TimeSpan parsedHeureDebut))
                    throw new BusinessRuleException("Format de l'heure de début invalide. Utilisez HH:mm.");

                if (!TimeSpan.TryParse(dto.HeureFinPrevue, out TimeSpan parsedHeureFinPrevue))
                    throw new BusinessRuleException("Format de l'heure de fin prévue invalide. Utilisez HH:mm.");

                var rdv = await _rendezVousRepository.GetByIdAsync(id);
                if (rdv == null) throw new RendezVousNotFoundException(id);

                if (parsedDate < DateOnly.FromDateTime(DateTime.UtcNow))
                    throw new BusinessRuleException("La nouvelle date ne peut pas être dans le passé.");
                
                if (parsedHeureDebut >= parsedHeureFinPrevue)
                    throw new BusinessRuleException("L'heure de début doit être inférieure à l'heure de fin.");

                // Vérifier la disponibilité du docteur
                var rdvList = await _rendezVousRepository.GetAllAsync();
                bool hasConflict = rdvList.Any(r => 
                    r.Id != id && 
                    r.DentisteId == rdv.DentisteId && 
                    r.Date == parsedDate &&
                    r.StatutId != 3 && r.StatutId != 5 && // Ne pas compter Annulé et Absent
                    ((parsedHeureDebut >= r.HeureDebut && parsedHeureDebut < r.HeureFinPrevue) ||
                     (parsedHeureFinPrevue > r.HeureDebut && parsedHeureFinPrevue <= r.HeureFinPrevue) ||
                     (parsedHeureDebut <= r.HeureDebut && parsedHeureFinPrevue >= r.HeureFinPrevue))
                );

                if (hasConflict)
                    throw new BusinessRuleException("Le dentiste n'est pas disponible à cet horaire (conflit de rendez-vous).");

                string ancienStatut = rdv.StatutId.ToString();
                
                rdv.Date = parsedDate;
                rdv.HeureDebut = parsedHeureDebut;
                rdv.HeureFinPrevue = parsedHeureFinPrevue;
                rdv.StatutId = 5; // 5 correspond à "Reporté" dans la base de données actuelle

                await _rendezVousRepository.UpdateAsync(rdv);

                await _rendezVousRepository.AddHistoriqueAsync(new HistoriqueRDV
                {
                    RendezVousId = rdv.Id,
                    AncienStatut = ancienStatut,
                    NouveauStatut = "Reporté",
                    DateModification = DateTime.UtcNow.ToPostgresTimestamp(),
                    ModifiePar = dto.ModifiePar?.ToString() ?? "Système",
                    TypeModification = TypeModificationEnum.Report.ToString(),
                    PatientId = rdv.PatientId,
                    DentisteId = rdv.DentisteId,
                    Date = rdv.Date,
                    HeureDebut = rdv.HeureDebut,
                    Motif = rdv.Motif,
                    EstUrgent = rdv.EstUrgent
                });
            }
            catch (BusinessRuleException)
            {
                throw; // Laisse passer l'exception pour qu'elle devienne 400
            }
            catch (RendezVousNotFoundException)
            {
                throw; // Laisse passer pour 404
            }
            catch (Exception ex)
            {
                // Transformer l'erreur inattendue en BusinessRuleException pour renvoyer un 400 propre au frontend
                throw new BusinessRuleException($"Impossible de reporter le rendez-vous. Vérifiez le format de la date et de l'heure. Détail: {ex.Message}");
            }
        }

        public async Task ConfirmAsync(int id, int modifiePar)
        {
            var rdv = await _rendezVousRepository.GetByIdAsync(id);
            if (rdv == null) throw new RendezVousNotFoundException(id);

            string ancienStatut = rdv.StatutId.ToString();
            rdv.StatutId = 2; // Confirmé

            await _rendezVousRepository.UpdateAsync(rdv);

            await _rendezVousRepository.AddHistoriqueAsync(new HistoriqueRDV
            {
                RendezVousId = rdv.Id,
                AncienStatut = ancienStatut,
                NouveauStatut = "Confirmé",
                DateModification = DateTime.UtcNow.ToPostgresTimestamp(),
                ModifiePar = modifiePar.ToString(),
                TypeModification = TypeModificationEnum.ModificationStatut.ToString(),
                PatientId = rdv.PatientId,
                DentisteId = rdv.DentisteId,
                Date = rdv.Date,
                HeureDebut = rdv.HeureDebut,
                Motif = rdv.Motif,
                EstUrgent = rdv.EstUrgent
            });
        }

        public async Task MarkAsCompletedAsync(int id, int modifiePar)
        {
            var rdv = await _rendezVousRepository.GetByIdAsync(id);
            if (rdv == null) throw new RendezVousNotFoundException(id);

            string ancienStatut = rdv.StatutId.ToString();
            rdv.StatutId = 4; // Effectué
            rdv.HeureFinReelle = DateTime.UtcNow.TimeOfDay;

            await _rendezVousRepository.UpdateAsync(rdv);

            await _rendezVousRepository.AddHistoriqueAsync(new HistoriqueRDV
            {
                RendezVousId = rdv.Id,
                AncienStatut = ancienStatut,
                NouveauStatut = "Effectué",
                DateModification = DateTime.UtcNow.ToPostgresTimestamp(),
                ModifiePar = modifiePar.ToString(),
                TypeModification = TypeModificationEnum.ModificationStatut.ToString(),
                PatientId = rdv.PatientId,
                DentisteId = rdv.DentisteId,
                Date = rdv.Date,
                HeureDebut = rdv.HeureDebut,
                Motif = rdv.Motif,
                EstUrgent = rdv.EstUrgent
            });

            await _rendezVousRepository.DeleteAsync(rdv.Id);
        }

        public async Task<IEnumerable<HistoriqueRDVDto>> GetHistoryAsync(int id)
        {
            var rdv = await _rendezVousRepository.GetByIdAsync(id);
            if (rdv == null) throw new RendezVousNotFoundException(id);

            var historique = await _rendezVousRepository.GetHistoryByRendezVousIdAsync(id);
            return historique.Select(h => HistoriqueRDVMapper.ToDto(h));
        }

        public async Task<IEnumerable<HistoriqueRDVDto>> GetAllHistoryAsync()
        {
            var historique = await _rendezVousRepository.GetAllHistoryAsync();
            return historique.Select(h => HistoriqueRDVMapper.ToDto(h));
        }
    }
}
