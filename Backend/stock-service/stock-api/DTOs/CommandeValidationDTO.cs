using System;

namespace StockApi.DTOs
{
    public class CommandeValidationDto
    {
        public int Id { get; set; }                    // id de la commande
        public required string TypeAction { get; set; }        // Validee or Refusee
        public string Commentaire { get; set; } = "";
        public DateTime? DateValidation { get; set; } = null;
    }
}