namespace Service_Personnel.DTOS.DemandeAbsence
{
    public class DemandeAbsenceResponseDto
    {
        public int IdDemande { get; set; }
        public DateTime DateCreation { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public string TypeDemande { get; set; } = null!;
        public string? Motif { get; set; }
        public string Statut { get; set; } = null!;
        public DateTime? DateTraitement { get; set; }
        public int IdEmploye { get; set; }
        public string Nom { get; set; } = null!;
        public string Prenom { get; set; } = null!;
    }
}