using System.ComponentModel.DataAnnotations;

namespace Service_Personnel.DTOS
{
    public class CreateDemandeAbsenceDto
    {
        [Required(ErrorMessage = "La date de début est obligatoire.")]
        public DateTime DateDebut { get; set; }

        [Required(ErrorMessage = "La date de fin est obligatoire.")]
        public DateTime DateFin { get; set; }

        [Required(ErrorMessage = "Le type de demande est obligatoire.")]
        [StringLength(100, ErrorMessage = "Le type de demande ne doit pas dépasser 100 caractères.")]
        public string TypeDemande { get; set; } = null!;

        [StringLength(255, ErrorMessage = "Le motif ne doit pas dépasser 255 caractères.")]
        public string? Motif { get; set; }
    }
}