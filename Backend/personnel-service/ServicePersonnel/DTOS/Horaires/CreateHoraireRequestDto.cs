using Service_Personnel.Enums.Horaires;
using System.ComponentModel.DataAnnotations;

namespace Service_Personnel.DTOS.Horaires
{
    public class CreateHoraireRequestDto
    {
        [Required(ErrorMessage = "Le jour est obligatoire.")]
        [EnumDataType(typeof(JourSemaine), ErrorMessage = "Le jour sélectionné est invalide.")]
        public JourSemaine? Jour { get; set; }

        [Required(ErrorMessage = "L'heure de début est obligatoire.")]
        public TimeOnly? HeureDebut { get; set; }

        [Required(ErrorMessage = "L'heure de fin est obligatoire.")]
        public TimeOnly? HeureFin { get; set; }

        [Required(ErrorMessage = "L'identifiant de l'employé est obligatoire.")]
        [Range(1, int.MaxValue, ErrorMessage = "L'identifiant de l'employé doit être valide.")]
        public int IdEmploye { get; set; }
    }
}