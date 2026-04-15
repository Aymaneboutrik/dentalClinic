using System.ComponentModel.DataAnnotations;

namespace Service_Personnel.DTOS.Employes
{
    public class CreateEmployeeRequestDto
    {
        [Required(ErrorMessage = "Le nom est obligatoire.")]
        [MinLength(1, ErrorMessage = "Le nom ne doit pas être vide.")]
        [RegularExpression(@"^[A-Za-zÀ-ÿ\s-]+$", ErrorMessage = "Le nom doit contenir uniquement des lettres.")]
        public string Nom { get; set; } = default!;

        [Required(ErrorMessage = "Le prénom est obligatoire.")]
        [MinLength(1, ErrorMessage = "Le prénom ne doit pas être vide.")]
        [RegularExpression(@"^[A-Za-zÀ-ÿ\s-]+$", ErrorMessage = "Le prénom doit contenir uniquement des lettres.")]
        public string Prenom { get; set; } = default!;

        [Required(ErrorMessage = "L'email est obligatoire.")]
        [EmailAddress(ErrorMessage = "Le format de l'email est invalide.")]
        public string Email { get; set; } = default!;

        [Required(ErrorMessage = "Le téléphone est obligatoire.")]
        [RegularExpression(@"^(05|06|07)[0-9]{8}$", ErrorMessage = "Le téléphone doit contenir 10 chiffres et commencer par 05, 06 ou 07.")]
        public string Telephone { get; set; } = default!;

        [Required(ErrorMessage = "Le rôle est obligatoire.")]
        [Range(1, int.MaxValue, ErrorMessage = "L'identifiant du rôle doit être valide.")]
        public int IdRole { get; set; }
    }
}