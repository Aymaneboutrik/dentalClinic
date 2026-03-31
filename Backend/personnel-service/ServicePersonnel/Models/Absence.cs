using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Service_Personnel.Models
{
    [Table("absence")]
    public class Absence
    {
        [Key]
        [Column("id_absence")]
        public int IdAbsence { get; set; }

        [Column("date_debut")]
        public DateTime DateDebut { get; set; }

        [Column("date_fin")]
        public DateTime DateFin { get; set; }

        [Column("type_absence")]
        public string TypeAbsence { get; set; } = null!;

        [Column("date_validation")]
        public DateTime DateValidation { get; set; }

        [Column("demande_id")]
        public int? DemandeId { get; set; }

        [Column("employe_id")]
        public int EmployeId { get; set; }

        [ForeignKey("DemandeId")]
        public DemandeAbsence? DemandeAbsence { get; set; } 

        [ForeignKey("EmployeId")]
        public Employe Employe { get; set; } = null!;
    }
}