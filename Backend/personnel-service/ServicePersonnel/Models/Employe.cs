using Service_Personnel.Enums.Employees;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Service_Personnel.Models
{
    [Table("employe")]
    public class Employe
    {
        [Key]  // PK (clé primaire)
        [Column("id_employe")]
        public int IdEmploye { get; set; }

        [Column("nom")]
        public string Nom { get; set; } = null!;

        [Column("prenom")]
        public string Prenom { get; set; } = null!;

        [Column("email")]
        public string Email { get; set; } = null!;

        [Column("telephone")]
        public string? Telephone { get; set; }

        [Column("statut")]
        public StatutEmploye Statut { get; set; } 

        [Column("id_role")]
        public int IdRole { get; set; }

        // Relation
        public Role Role { get; set; } = null!;
        public ICollection<Absence> Absences { get; set; } = new List<Absence>();// Relation 1-N avec Absence / Un employé peut avoir plusieurs absences. 
        public ICollection<Horaire> Horaires { get; set; } = new List<Horaire>();//// Relation 1-N avec Horaire / Un employé peut avoir plusieurs horaires.
    }
}