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
                ModifiePar = 1, // ID numérique de l'auteur (ex: 1 pour Système)
                TypeModification = TypeModificationEnum.Creation.ToString()
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
                ModifiePar = 1,
                TypeModification = TypeModificationEnum.ModificationStatut.ToString()
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
                ModifiePar = int.TryParse(modifiePar, out int authorId) ? authorId : 1,
                TypeModification = TypeModificationEnum.Annulation.ToString()
            });
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
                ModifiePar = modifiePar,
                TypeModification = TypeModificationEnum.Absence.ToString()
            });
        }

        public async Task RescheduleAsync(int id, RescheduleRendezVousDto dto)
        {
            var rdv = await _rendezVousRepository.GetByIdAsync(id);
            if (rdv == null) throw new RendezVousNotFoundException(id);

            if (dto.Date < DateOnly.FromDateTime(DateTime.UtcNow))
                throw new BusinessRuleException("La nouvelle date ne peut pas être dans le passé.");

            string ancienStatut = rdv.StatutId.ToString();
            
            rdv.Date = dto.Date;
            rdv.HeureDebut = dto.HeureDebut;
            rdv.HeureFinPrevue = dto.HeureFinPrevue;
            rdv.StatutId = 6; // Reporté

            await _rendezVousRepository.UpdateAsync(rdv);

            await _rendezVousRepository.AddHistoriqueAsync(new HistoriqueRDV
            {
                RendezVousId = rdv.Id,
                AncienStatut = ancienStatut,
                NouveauStatut = "Reporté",
                DateModification = DateTime.UtcNow.ToPostgresTimestamp(),
                ModifiePar = dto.ModifiePar,
                TypeModification = TypeModificationEnum.Report.ToString()
            });
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
                ModifiePar = modifiePar,
                TypeModification = TypeModificationEnum.ModificationStatut.ToString()
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
                ModifiePar = modifiePar,
                TypeModification = TypeModificationEnum.ModificationStatut.ToString()
            });
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
