using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Service_Personnel.Models
{
    [Table("role")]
    public class Role
    {
        [Key]
        [Column("id_role")]
        public int IdRole { get; set; }

        [Column("nom_role")]
        public string NomRole { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        public ICollection<Employe> Employes { get; set; } = new List<Employe>();
    }
}