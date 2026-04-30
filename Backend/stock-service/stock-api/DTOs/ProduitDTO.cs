using System;

namespace StockApi.DTOs
{
	public class ProduitDto
	{
		public int Id { get; set; }
		public string Nom { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;
		public int Quantite { get; set; }
		public int SeuilAlerte { get; set; }
		public DateTime DatePeremption { get; set; }
		public bool Actif { get; set; }
	}
}