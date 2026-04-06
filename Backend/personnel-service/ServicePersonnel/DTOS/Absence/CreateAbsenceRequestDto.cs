using System.ComponentModel.DataAnnotations;

namespace Service_Personnel.DTOS.Absence
{
    public class CreateAbsenceRequestDto
    {
        [Required(ErrorMessage = "La date de début est obligatoire.")]
        public DateTime DateDebut { get; set; }

        [Required(ErrorMessage = "La date de fin est obligatoire.")]
        public DateTime DateFin { get; set; }

        [Required(ErrorMessage = "Le type d'absence est obligatoire.")]
        [StringLength(100, ErrorMessage = "Le type d'absence ne doit pas dépasser 100 caractères.")]
        public string TypeAbsence { get; set; } = null!;

        [Required(ErrorMessage = "L'identifiant de l'employé est obligatoire.")]
        public int EmployeId { get; set; }
    }
}