using System.Collections.Generic;

namespace StockApi.Models
{
	public class Fournisseur
	{
		public int Id { get; set; }
		public string Nom { get; set; } = string.Empty;
		public string Adresse { get; set; } = string.Empty;
		public string Telephone { get; set; } = string.Empty;

		public ICollection<Commande> Commandes { get; set; } = new List<Commande>();
	}
}