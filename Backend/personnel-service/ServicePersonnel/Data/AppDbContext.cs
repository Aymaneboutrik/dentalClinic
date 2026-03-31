using Microsoft.EntityFrameworkCore;
using Service_Personnel.Models;
using System.Reflection.Emit;

namespace Service_Personnel.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            //constructeure
        }

        public DbSet<Role> Roles => Set<Role>();
        public DbSet<Employe> Employes => Set<Employe>();
        public DbSet<Absence> Absences => Set<Absence>();
        public DbSet<DemandeAbsence> DemandeAbsences { get; set; }
        public DbSet<Horaire> Horaires => Set<Horaire>();
        // configuration des relation et des clés primaires et étrangères
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {// il est protected par ce que il est defini dans la classe mere dbcontext et il est override par ce que on veut le redéfinir pour notre propre logique


            // ✅ PK Absence
            modelBuilder.Entity<Absence>()
                .HasKey(a => a.IdAbsence);

            // ✅ FK Absence -> Employe
            modelBuilder.Entity<Absence>()
                .HasOne(a => a.Employe)
                .WithMany(e => e.Absences)
                .HasForeignKey(a => a.EmployeId);

            // ✅ PK Employe
            modelBuilder.Entity<Employe>()
                .HasKey(e => e.IdEmploye);

            // ✅ FK Employe -> Role
            modelBuilder.Entity<Employe>()
                .HasOne(e => e.Role)
                .WithMany(r => r.Employes)
                .HasForeignKey(e => e.IdRole);

            // ✅ PK Role
            modelBuilder.Entity<Role>()
                .HasKey(r => r.IdRole);
            ////////////////////////////////////////////////////////////////////////
            modelBuilder.Entity<Horaire>().ToTable("horaire");

            // ✅ PK Horaire + FK -> Employe (si Horaire a IdHoraire)
            modelBuilder.Entity<Horaire>()
                .HasKey(h => h.IdHoraire);

            modelBuilder.Entity<Horaire>()
                .HasOne(h => h.Employe)
                .WithMany(e => e.Horaires)
                .HasForeignKey(h => h.IdEmploye);

            //  Conversion enum JourSemaine -> string dans la base

            modelBuilder.Entity<Horaire>()
                .Property(h => h.Jour)
                .HasConversion<string>();


            //////////////////////////////////////////

            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Employe>()
           .Property(e => e.Statut);
            //.HasConversion<string>();
        }
       
        
        
          
        
    }
}