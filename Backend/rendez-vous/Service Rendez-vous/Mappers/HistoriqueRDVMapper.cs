using Service_Rendez_vous.DTOs;
using Service_Rendez_vous.Models;

namespace Service_Rendez_vous.Mappers
{
    public static class HistoriqueRDVMapper
    {
        public static HistoriqueRDVDto ToDto(HistoriqueRDV model)
        {
            if (model == null) return null;

            return new HistoriqueRDVDto
            {
                Id = model.Id,
                RendezVousId = model.RendezVousId,
                AncienStatut = model.AncienStatut,
                NouveauStatut = model.NouveauStatut,
                DateModification = model.DateModification,
                TypeModification = model.TypeModification,
                PatientId = model.PatientId ?? model.RendezVous?.PatientId,
                DentisteId = model.DentisteId ?? model.RendezVous?.DentisteId,
                Date = (model.Date ?? model.RendezVous?.Date)?.ToString("yyyy-MM-dd"),
                HeureDebut = (model.HeureDebut ?? model.RendezVous?.HeureDebut)?.ToString(@"hh\:mm"),
                Motif = model.Motif ?? model.RendezVous?.Motif,
                EstUrgent = model.EstUrgent ?? model.RendezVous?.EstUrgent
            };
        }
    }
}
