using System;
using StockApi.Enums;
using System.Collections.Generic;
using StockApi.DTOs;

namespace StockApi.DTOs
{
	public class CommandeAvecLignesDto
	{
		public int Id { get; set; }
		public string Nom { get; set; } = string.Empty;
		public DateTime Date { get; set; }
		public OrderStatus Statut { get; set; }
		public int FournisseurId { get; set; }

		public List<LigneCommandeDto> Lignes { get; set; } = new List<LigneCommandeDto>();
	}
}