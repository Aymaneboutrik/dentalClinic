using System;

namespace StockApi.DTOs
{
    public class CommandeValidationDto
    {
        public int Id { get; set; }                    // id de la commande
        public string TypeAction { get; set; }        // Validee, Refusee, ModificationExigee
        public string Commentaire { get; set; } = "à saisir";
        public DateTime? DateValidation { get; set; } = null; // "à saisir"
    }
}