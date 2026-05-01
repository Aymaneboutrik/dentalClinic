using System;
using Service_Rendez_vous.Enums;

namespace Service_Rendez_vous.Models
{
    public class HistoriqueRDV
    {
        public int Id { get; set; }
        public int? RendezVousId { get; set; }
        public string AncienStatut { get; set; } = string.Empty;
        public string NouveauStatut { get; set; } = string.Empty;
        public DateTime DateModification { get; set; }
        public string? ModifiePar { get; set; }
        public string? TypeModification { get; set; }

        public int? PatientId { get; set; }
        public int? DentisteId { get; set; }
        public DateOnly? Date { get; set; }
        public TimeSpan? HeureDebut { get; set; }
        public string? Motif { get; set; }
        public bool? EstUrgent { get; set; }

        // Navigation property
        public virtual RendezVous? RendezVous { get; set; }
    }
}
