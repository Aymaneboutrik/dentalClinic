namespace GestionRH.DTOs.Horaire
{
    public class HoraireResponseDto
    {
        public int IdHoraire { get; set; }

        public string Jour { get; set; } = default!;

        public TimeOnly HeureDebut { get; set; }

        public TimeOnly HeureFin { get; set; }

        public int IdEmploye { get; set; }

        public string Nom { get; set; } = default!;

        public string Prenom { get; set; } = default!;

        public string Role { get; set; } = default!;
    }
}