namespace Service_Personnel.DTOS.Absence
{
    public class AbsenceResponseDto
    {
        public int IdAbsence { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public string TypeAbsence { get; set; } = null!;
        public DateTime DateValidation { get; set; }
        public int? DemandeId { get; set; }
        public int EmployeId { get; set; }
        public string Nom { get; set; } = null!;
        public string Prenom { get; set; } = null!;
    }
}