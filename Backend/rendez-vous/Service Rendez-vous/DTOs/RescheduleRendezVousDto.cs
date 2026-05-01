using System;

namespace Service_Rendez_vous.DTOs
{
    public class RescheduleRendezVousDto
    {
        public string? Date { get; set; }
        public string? HeureDebut { get; set; }
        public string? HeureFinPrevue { get; set; }
        public int? ModifiePar { get; set; }
    }
}
