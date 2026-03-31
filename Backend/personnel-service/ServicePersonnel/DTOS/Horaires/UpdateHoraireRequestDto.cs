using Service_Personnel.Enums.Horaires;

namespace GestionRH.DTOs.Horaire
{
    public class UpdateHoraireRequestDto
    {
       
        public JourSemaine? Jour { get; set; }

       
        public TimeSpan? HeureDebut { get; set; }

       
        public TimeSpan? HeureFin { get; set; }
    }
}