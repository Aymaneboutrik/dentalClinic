namespace Service_Personnel.DTOS.Employes
{
    public class EmployeeResponseDto
    {
        // Identifiant de l'employé
        public int IdEmploye { get; set; }

        
        public string Nom { get; set; } = null!;
        public string Prenom { get; set; } = null!;

        // Contact
        public string Email { get; set; } = null!;
        public string? Telephone { get; set; }

        // Statut (enum)
        public string Statut { get; set; } = null!;

        public string NomRole { get; set; } = null!;
    }
}