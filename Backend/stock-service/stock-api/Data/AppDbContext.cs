using Microsoft.EntityFrameworkCore;
using StockApi.Models;

namespace StockApi.Data
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options)
			: base(options)
		{
		}

		public DbSet<Fournisseur> Fournisseurs { get; set; } = null!;
		public DbSet<Commande> Commandes { get; set; } = null!;
		public DbSet<LigneCommande> LignesCommandes { get; set; } = null!;
		public DbSet<Produit> Produits { get; set; } = null!;
        public DbSet<MouvementStock> MouvementsStock { get; set; } = null!;
        public DbSet<CommandeValidation> CommandeValidations { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			modelBuilder.Entity<Commande>()
				.HasMany(c => c.Lignes)
				.WithOne(l => l.Commande!)
				.HasForeignKey(l => l.CommandeId)
				.OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<LigneCommande>()
                .HasOne(l => l.Produit)
                .WithMany(p => p.Lignes)
                .HasForeignKey(l => l.ProduitId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MouvementStock>()
                .HasOne(m => m.Produit)
                .WithMany()
                .HasForeignKey(m => m.ProduitId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MouvementStock>()
                .HasOne(m => m.LigneCommande)
                .WithMany()
                .HasForeignKey(m => m.LigneCommandeId)
                .OnDelete(DeleteBehavior.SetNull);

			modelBuilder.Entity<Fournisseur>()
				.Property(f => f.Nom)
				.IsRequired()
				.HasMaxLength(100);

			modelBuilder.Entity<Produit>()
				.Property(p => p.Nom)
				.IsRequired()
				.HasMaxLength(100);

			modelBuilder.Entity<Produit>()
				.HasIndex(p => p.Nom)
				.IsUnique();

			modelBuilder.Entity<CommandeValidation>()
				.HasOne(cv => cv.Commande)
				.WithOne()
				.HasForeignKey<CommandeValidation>(cv => cv.CommandeId)
				.OnDelete(DeleteBehavior.Cascade);
		}
	}
}