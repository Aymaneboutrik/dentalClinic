using System;

namespace StockApi.Models
{
	public class CommandeValidation
	{
		public int Id { get; set; }
		public int CommandeId { get; set; } // FK vers Commande
		public Commande? Commande { get; set; } // Navigation
		public required string TypeAction { get; set; } // Validee or Refusee
		public string Commentaire { get; set; } = "";
		public DateTime? DateValidation { get; set; } = null;
	}
}