using Service_Personnel.Enums.Employees;
using System.ComponentModel.DataAnnotations;

namespace Service_Personnel.DTOS.Employes
{   //recevoir les nouvelles données pour modifier un employé
    public class UpdateEmployeeRequestDto
    {
        [MinLength(1, ErrorMessage = "Le nom ne doit pas être vide.")]
        public string? Nom { get; set; } = default!;

        [MinLength(1, ErrorMessage = "Le prénom ne doit pas être vide.")]
        public string? Prenom { get; set; } = default!;

        [EmailAddress(ErrorMessage = "Le format de l'email est invalide.")]
        public string? Email { get; set; } = default!;

        [RegularExpression(@"^(05|06|07)[0-9]{8}$", ErrorMessage = "Le téléphone doit contenir 10 chiffres et commencer par 05, 06 ou 07.")]
        public string? Telephone { get; set; } = default!;

        [Range(1, int.MaxValue, ErrorMessage = "L'identifiant du rôle doit être valide.")]
        public int? IdRole { get; set; }

        [EnumDataType(typeof(StatutEmploye), ErrorMessage = "Le statut est invalide.")]
        public StatutEmploye? Statut { get; set; }  // dans le cas de modification  le status  etre changeable !! 
    }
}
