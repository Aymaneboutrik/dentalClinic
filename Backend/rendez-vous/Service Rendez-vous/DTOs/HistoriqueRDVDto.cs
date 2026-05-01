using System;

namespace Service_Rendez_vous.DTOs
{
    public class HistoriqueRDVDto
    {
        public int Id { get; set; }
        public int? RendezVousId { get; set; }
        public string AncienStatut { get; set; } = string.Empty;
        public string NouveauStatut { get; set; } = string.Empty;
        public DateTime DateModification { get; set; }
        public string? TypeModification { get; set; }

        public int? PatientId { get; set; }
        public int? DentisteId { get; set; }
        public string? Date { get; set; }
        public string? HeureDebut { get; set; }
        public string? Motif { get; set; }
        public bool? EstUrgent { get; set; }
    }
}
