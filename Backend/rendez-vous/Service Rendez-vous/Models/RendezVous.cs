namespace Service_Rendez_vous.Models
{
    public class RendezVous
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DentisteId { get; set; }
        public DateOnly  Date { get; set; }
        public TimeSpan HeureDebut { get; set; }
        public string Motif { get; set; } = string.Empty;
        public int StatutId { get; set; }
        public TimeSpan HeureFinPrevue { get; set; }
        public TimeSpan? HeureFinReelle { get; set; }
        public bool? EstUrgent { get; set; }
    }
}