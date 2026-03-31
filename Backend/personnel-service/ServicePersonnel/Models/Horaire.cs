using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using Service_Personnel.Enums.Horaires;

namespace Service_Personnel.Models
{
    public class Horaire
    {
        //  Clé primaire de l'entité Horaire
        public int IdHoraire { get; set; }

        //  Jour de la semaine (enum pour éviter les erreurs de string)
        public JourSemaine Jour { get; set; }

        //  Heure de début de l'horaire
        // TimeOnly est utilisé pour représenter uniquement une heure (sans date)
        public TimeOnly HeureDebut { get; set; }

        //  Heure de fin de l'horaire
        public TimeOnly HeureFin { get; set; }

        //  Clé étrangère vers Employe
        public int IdEmploye { get; set; }

        //  Propriété de navigation vers Employe
        // Permet à EF Core de gérer la relation (1 Horaire -> 1 Employe)
        public Employe Employe { get; set; }
    }
}