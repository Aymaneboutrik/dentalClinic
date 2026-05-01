using Microsoft.EntityFrameworkCore;
using Service_Rendez_vous.Models;

namespace Service_Rendez_vous.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<RendezVous> RendezVous { get; set; }
        public DbSet<StatutRDV> StatutRDV { get; set; }
        public DbSet<HistoriqueRDV> HistoriqueRDV { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Table : rendezvous
            modelBuilder.Entity<RendezVous>(entity =>
            {
                entity.ToTable("rendezvous");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.PatientId).HasColumnName("patientid");
                entity.Property(e => e.DentisteId).HasColumnName("dentisteid");
                entity.Property(e => e.Date).HasColumnName("date").HasColumnType("date");
                entity.Property(e => e.HeureDebut).HasColumnName("heuredebut").HasColumnType("time without time zone");
                entity.Property(e => e.Motif).HasColumnName("motif");
                entity.Property(e => e.StatutId).HasColumnName("statutid");
                entity.Property(e => e.HeureFinPrevue).HasColumnName("heurefinprevue").HasColumnType("time without time zone");
                entity.Property(e => e.HeureFinReelle).HasColumnName("heurefinreelle").HasColumnType("time without time zone");
                entity.Property(e => e.EstUrgent).HasColumnName("esturgent");

                // Relationships
                entity.HasOne(d => d.Statut)
                      .WithMany()
                      .HasForeignKey(d => d.StatutId)
                      .HasConstraintName("fk_rendezvous_statutrdv");
            });

            // Table : historiquerdv
            modelBuilder.Entity<HistoriqueRDV>(entity =>
            {
                entity.ToTable("historiquerdv");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.RendezVousId).HasColumnName("rendezvousid");
                entity.Property(e => e.AncienStatut).HasColumnName("ancienstatut");
                entity.Property(e => e.NouveauStatut).HasColumnName("nouveaustatut");
                entity.Property(e => e.DateModification)
                      .HasColumnName("datemodification")
                      .HasColumnType("timestamp without time zone");
                entity.Property(e => e.ModifiePar).HasColumnName("modifiepar");
                entity.Property(e => e.TypeModification).HasColumnName("typemodification");
                entity.Property(e => e.PatientId).HasColumnName("patientid");
                entity.Property(e => e.DentisteId).HasColumnName("dentisteid");
                entity.Property(e => e.Date).HasColumnName("date").HasColumnType("date");
                entity.Property(e => e.HeureDebut).HasColumnName("heuredebut").HasColumnType("time without time zone");
                entity.Property(e => e.Motif).HasColumnName("motif");
                entity.Property(e => e.EstUrgent).HasColumnName("esturgent");

                // Relationships
                entity.HasOne(d => d.RendezVous)
                      .WithMany(p => p.Historiques)
                      .HasForeignKey(d => d.RendezVousId)
                      .HasConstraintName("fk_historiquerdv_rendezvous")
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Table : statutrdv
            modelBuilder.Entity<StatutRDV>(entity =>
            {
                entity.ToTable("statutrdv");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Libelle).HasColumnName("libelle");
            });
        }
    }
}