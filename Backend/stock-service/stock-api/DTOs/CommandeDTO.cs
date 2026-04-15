using System;
using StockApi.Enums;

namespace StockApi.DTOs
{
	public class CommandeDto
	{
		public int Id { get; set; }
		public string Nom { get; set; } = string.Empty;
		public DateTime Date { get; set; }
		public OrderStatus Statut { get; set; }
		public int FournisseurId { get; set; }
	}
}