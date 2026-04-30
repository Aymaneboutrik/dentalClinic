using StockApi.Enums;

namespace StockApi.DTOs
{
	public class LigneCommandeDto
	{
		public int Id { get; set; }
		public int ProduitId { get; set; }
		public int Quantite { get; set; }
		public decimal PrixUnitaire { get; set; }
		public decimal SousTotal { get; set; }
		public int CommandeId { get; set; }
	}
}