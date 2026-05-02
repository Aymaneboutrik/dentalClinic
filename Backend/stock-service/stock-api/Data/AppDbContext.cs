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

			// Map entities to the existing init-db schema (snake_case, singular table names).
			// This avoids destructive DB recreation and keeps compatibility with the current Docker volume.
			modelBuilder.Entity<Fournisseur>(entity =>
			{
				entity.ToTable("fournisseur");
				entity.Property(e => e.Id).HasColumnName("id");
				entity.Property(e => e.Nom).HasColumnName("nom").IsRequired().HasMaxLength(100);
				entity.Property(e => e.Adresse).HasColumnName("adresse");
				entity.Property(e => e.Telephone).HasColumnName("telephone");
			});

			modelBuilder.Entity<Produit>(entity =>
			{
				entity.ToTable("produit");
				entity.Property(e => e.Id).HasColumnName("id");
				entity.Property(e => e.Nom).HasColumnName("nom").IsRequired().HasMaxLength(100);
				entity.Property(e => e.Description).HasColumnName("description").IsRequired();
				entity.Property(e => e.Quantite).HasColumnName("quantite");
				entity.Property(e => e.SeuilAlerte).HasColumnName("seuil_alerte");
				entity.Property(e => e.DatePeremption).HasColumnName("date_peremption");
				entity.Property(e => e.Actif).HasColumnName("actif");
				entity.HasIndex(e => e.Nom).IsUnique();
			});

			modelBuilder.Entity<Commande>(entity =>
			{
				entity.ToTable("commande");
				entity.Property(e => e.Id).HasColumnName("id");
				entity.Property(e => e.Nom).HasColumnName("nom").IsRequired();
				entity.Property(e => e.Date).HasColumnName("date");
				entity.Property(e => e.Statut).HasColumnName("statut");
				entity.Property(e => e.FournisseurId).HasColumnName("fournisseur_id");
			});

			modelBuilder.Entity<LigneCommande>(entity =>
			{
				entity.ToTable("ligne_commande");
				entity.Property(e => e.Id).HasColumnName("id");
				entity.Property(e => e.Quantite).HasColumnName("quantite");
				entity.Property(e => e.PrixUnitaire).HasColumnName("prix_unitaire");
				entity.Property(e => e.CommandeId).HasColumnName("commande_id");
				entity.Property(e => e.ProduitId).HasColumnName("produit_id");
			});

			modelBuilder.Entity<MouvementStock>(entity =>
			{
				entity.ToTable("mouvement_stock");
				entity.Property(e => e.Id).HasColumnName("id");
				entity.Property(e => e.TypeMouvement).HasColumnName("type_mouvement");
				entity.Property(e => e.Quantite).HasColumnName("quantite");
				entity.Property(e => e.DateMouvement).HasColumnName("date_mouvement");
				entity.Property(e => e.ProduitId).HasColumnName("produit_id");
				entity.Property(e => e.LigneCommandeId).HasColumnName("ligne_commande_id");
			});

			modelBuilder.Entity<CommandeValidation>(entity =>
			{
				entity.ToTable("commande_validation");
				entity.Property(e => e.Id).HasColumnName("id");
				entity.Property(e => e.CommandeId).HasColumnName("commande_id");
				entity.Property(e => e.TypeAction).HasColumnName("type_action").IsRequired();
				entity.Property(e => e.Commentaire).HasColumnName("commentaire");
				entity.Property(e => e.DateValidation).HasColumnName("date_validation");
			});

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

			modelBuilder.Entity<CommandeValidation>()
				.HasOne(cv => cv.Commande)
				.WithOne()
				.HasForeignKey<CommandeValidation>(cv => cv.CommandeId)
				.OnDelete(DeleteBehavior.Cascade);
		}
	}
}