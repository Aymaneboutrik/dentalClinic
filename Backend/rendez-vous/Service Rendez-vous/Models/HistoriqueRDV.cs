using System;
using Service_Rendez_vous.Enums;

namespace Service_Rendez_vous.Models
{
    public class HistoriqueRDV
    {
        public int Id { get; set; }
        public int RendezVousId { get; set; }
        public string AncienStatut { get; set; } = string.Empty;
        public string NouveauStatut { get; set; } = string.Empty;
        public DateTime DateModification { get; set; }
        public int? ModifiePar { get; set; }
        public string? TypeModification { get; set; }
    }
}
