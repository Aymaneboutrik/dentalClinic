using System;
using StockApi.Enums;

namespace StockApi.Models
{
	public class MouvementStock
	{
		public int Id { get; set; }
		public TypeMouvement TypeMouvement { get; set; }
		public int Quantite { get; set; }
		public DateTime? DateMouvement { get; set; }  // null par défaut = "à saisir"

		// Lien avec Produit ou Commande si nécessaire
		public int? ProduitId { get; set; }
		public int? CommandeId { get; set; }
	}
}