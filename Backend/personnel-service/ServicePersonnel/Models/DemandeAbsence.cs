using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Service_Personnel.Models
{
    [Table("demande_absence")]
    public class DemandeAbsence
    {
        [Key]
        [Column("id_demande")]
        public int IdDemande { get; set; }

        [Column("date_creation")]
        public DateTime DateCreation { get; set; }

        [Column("date_debut")]
        public DateTime DateDebut { get; set; }

        [Column("date_fin")]
        public DateTime DateFin { get; set; }

        [Column("type_demande")]
        public string TypeDemande { get; set; } = null!;

        [Column("motif")]
        public string? Motif { get; set; }

        [Column("statut")]
        public string Statut { get; set; } = null!;

        [Column("date_traitement")]
        public DateTime? DateTraitement { get; set; }

        [Column("employe_id")]
        public int EmployeId { get; set; }

        [Column("traite_par_id")]
        public int? TraiteParId { get; set; }

        [ForeignKey("EmployeId")]
        public Employe Employe { get; set; } = null!;
    }
}