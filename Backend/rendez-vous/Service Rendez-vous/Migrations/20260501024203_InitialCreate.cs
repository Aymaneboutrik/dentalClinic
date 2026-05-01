using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Service_Rendez_vous.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "historiquerdv",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    rendezvousid = table.Column<int>(type: "integer", nullable: false),
                    ancienstatut = table.Column<string>(type: "text", nullable: false),
                    nouveaustatut = table.Column<string>(type: "text", nullable: false),
                    datemodification = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    modifiepar = table.Column<int>(type: "integer", nullable: true),
                    typemodification = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_historiquerdv", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "rendezvous",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    patientid = table.Column<int>(type: "integer", nullable: false),
                    dentisteid = table.Column<int>(type: "integer", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    heuredebut = table.Column<TimeSpan>(type: "time without time zone", nullable: false),
                    motif = table.Column<string>(type: "text", nullable: false),
                    statutid = table.Column<int>(type: "integer", nullable: false),
                    heurefinprevue = table.Column<TimeSpan>(type: "time without time zone", nullable: false),
                    heurefinreelle = table.Column<TimeSpan>(type: "time without time zone", nullable: true),
                    esturgent = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rendezvous", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "statutrdv",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    libelle = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_statutrdv", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "historiquerdv");

            migrationBuilder.DropTable(
                name: "rendezvous");

            migrationBuilder.DropTable(
                name: "statutrdv");
        }
    }
}
