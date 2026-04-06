namespace StockApi.DTOs
{
	public class FournisseurDto
	{
		public int Id { get; set; }
		public string Nom { get; set; } = string.Empty;
		public string Adresse { get; set; } = string.Empty;
		public string Telephone { get; set; } = string.Empty;
	}
}