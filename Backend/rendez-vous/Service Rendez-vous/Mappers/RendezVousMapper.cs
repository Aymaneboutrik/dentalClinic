using Service_Rendez_vous.DTOs;
using Service_Rendez_vous.Models;

namespace Service_Rendez_vous.Mappers
{
    public static class RendezVousMapper
    {
        public static RendezVousDto ToDto(RendezVous model)
        {
            if (model == null) return null;

            return new RendezVousDto
            {
                Id = model.Id,
                PatientId = model.PatientId,
                DentisteId = model.DentisteId,
                Date = model.Date,
                HeureDebut = model.HeureDebut,
                Motif = model.Motif,
                StatutId = model.StatutId == 5 ? 6 : model.StatutId, // Map DB 5 (Reporté) to Frontend 6 (Reporté)
                HeureFinPrevue = model.HeureFinPrevue,
                HeureFinReelle = model.HeureFinReelle,
                EstUrgent = model.EstUrgent
            };
        }

        public static RendezVous ToModel(RendezVousDto dto)
        {
            if (dto == null) return null;

            return new RendezVous
            {
                Id = dto.Id,
                PatientId = dto.PatientId,
                DentisteId = dto.DentisteId,
                Date = dto.Date,
                HeureDebut = dto.HeureDebut,
                Motif = dto.Motif,
                StatutId = dto.StatutId,
                HeureFinPrevue = dto.HeureFinPrevue,
                HeureFinReelle = dto.HeureFinReelle,
                EstUrgent = dto.EstUrgent
            };
        }
    }
}
