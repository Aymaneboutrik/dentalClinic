using System;

namespace Service_Rendez_vous.DTOs
{
    public class RescheduleRendezVousDto
    {
        public DateOnly Date { get; set; }
        public TimeSpan HeureDebut { get; set; }
        public TimeSpan HeureFinPrevue { get; set; }
        public int ModifiePar { get; set; }
    }
}
