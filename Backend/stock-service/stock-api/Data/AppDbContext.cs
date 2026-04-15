using Microsoft.EntityFrameworkCore;
using StockApi.Models;
using StockApi.Enums;

namespace StockApi.Data
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options)
			: base(options)
		{
		}

		// 🔹 Tables
		public DbSet<Fournisseur> Fournisseurs { get; set; } = null!;
		public DbSet<Commande> Commandes { get; set; } = null!;
		public DbSet<LigneCommande> LignesCommandes { get; set; } = null!;
		public DbSet<Produit> Produits { get; set; } = null!;
        public DbSet<MouvementStock> MouvementsStock { get; set; } = null!;
        public DbSet<Sortie> Sorties { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// 🔹 Commande → LignesCommande (1:N) avec cascade delete
			modelBuilder.Entity<Commande>()
				.HasMany(c => c.Lignes)
				.WithOne(l => l.Commande!)
				.HasForeignKey(l => l.CommandeId)
				.OnDelete(DeleteBehavior.Cascade);

			// 🔹 Exemple de contraintes supplémentaires si nécessaire
			modelBuilder.Entity<Fournisseur>()
				.Property(f => f.Nom)
				.IsRequired()
				.HasMaxLength(100);

			modelBuilder.Entity<Produit>()
				.Property(p => p.Nom)
				.IsRequired()
				.HasMaxLength(100);
		}
	}
}