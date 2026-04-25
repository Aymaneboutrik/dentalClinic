using System;

namespace Service_Rendez_vous.DTOs
{
    public class CreateRendezVousDto
    {
        public int PatientId { get; set; }
        public int DentisteId { get; set; }
        public DateOnly Date { get; set; }
        public TimeSpan HeureDebut { get; set; }
        public string Motif { get; set; } = string.Empty;
        public TimeSpan HeureFinPrevue { get; set; }
        public bool? EstUrgent { get; set; }
    }
}
