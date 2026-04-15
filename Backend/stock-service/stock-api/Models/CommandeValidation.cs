using System;

namespace StockApi.Models
{
	public class CommandeValidation
	{
		public int Id { get; set; } // id de la commande
		public required string TypeAction { get; set; } // Validee, Refusee, ModificationExigee
		public string Commentaire { get; set; } = "à saisir";
		public DateTime? DateValidation { get; set; } = null; // "à saisir"
	}
}