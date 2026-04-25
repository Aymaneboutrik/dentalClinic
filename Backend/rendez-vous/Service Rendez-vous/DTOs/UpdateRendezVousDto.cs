using System;

namespace Service_Rendez_vous.DTOs
{
    public class UpdateRendezVousDto
    {
        public DateOnly Date { get; set; }
        public TimeSpan HeureDebut { get; set; }
        public string Motif { get; set; } = string.Empty;
        public TimeSpan HeureFinPrevue { get; set; }
        public bool? EstUrgent { get; set; }
    }
}
