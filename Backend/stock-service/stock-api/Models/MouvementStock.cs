using System;
using StockApi.Enums;

namespace StockApi.Models
{
	public class MouvementStock
	{
		public int Id { get; set; }
		public TypeMouvement TypeMouvement { get; set; }
		public int Quantite { get; set; }
		public DateTime DateMouvement { get; set; } = DateTime.Now;

		public int? ProduitId { get; set; }
		public Produit? Produit { get; set; }

		public int? LigneCommandeId { get; set; }
		public LigneCommande? LigneCommande { get; set; }
	}
}