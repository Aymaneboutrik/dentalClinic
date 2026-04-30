using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace StockApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Fournisseurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Adresse = table.Column<string>(type: "text", nullable: false),
                    Telephone = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fournisseurs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Produits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Quantite = table.Column<int>(type: "integer", nullable: false),
                    SeuilAlerte = table.Column<int>(type: "integer", nullable: false),
                    DatePeremption = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Actif = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produits", x => x.Id);
                });


            migrationBuilder.CreateTable(
                name: "Commandes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Statut = table.Column<int>(type: "integer", nullable: false),
                    FournisseurId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Commandes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Commandes_Fournisseurs_FournisseurId",
                        column: x => x.FournisseurId,
                        principalTable: "Fournisseurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CommandeValidation",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CommandeId = table.Column<int>(type: "integer", nullable: false),
                    TypeAction = table.Column<string>(type: "text", nullable: false),
                    Commentaire = table.Column<string>(type: "text", nullable: false),
                    DateValidation = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommandeValidation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommandeValidation_Commandes_CommandeId",
                        column: x => x.CommandeId,
                        principalTable: "Commandes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LignesCommandes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Quantite = table.Column<int>(type: "integer", nullable: false),
                    PrixUnitaire = table.Column<decimal>(type: "numeric", nullable: false),
                    CommandeId = table.Column<int>(type: "integer", nullable: false),
                    ProduitId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LignesCommandes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LignesCommandes_Commandes_CommandeId",
                        column: x => x.CommandeId,
                        principalTable: "Commandes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LignesCommandes_Produits_ProduitId",
                        column: x => x.ProduitId,
                        principalTable: "Produits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MouvementsStock",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TypeMouvement = table.Column<int>(type: "integer", nullable: false),
                    Quantite = table.Column<int>(type: "integer", nullable: false),
                    DateMouvement = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ProduitId = table.Column<int>(type: "integer", nullable: true),
                    LigneCommandeId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MouvementsStock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MouvementsStock_LignesCommandes_LigneCommandeId",
                        column: x => x.LigneCommandeId,
                        principalTable: "LignesCommandes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MouvementsStock_Produits_ProduitId",
                        column: x => x.ProduitId,
                        principalTable: "Produits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Commandes_FournisseurId",
                table: "Commandes",
                column: "FournisseurId");

            migrationBuilder.CreateIndex(
                name: "IX_CommandeValidation_CommandeId",
                table: "CommandeValidation",
                column: "CommandeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LignesCommandes_CommandeId",
                table: "LignesCommandes",
                column: "CommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_LignesCommandes_ProduitId",
                table: "LignesCommandes",
                column: "ProduitId");

            migrationBuilder.CreateIndex(
                name: "IX_MouvementsStock_LigneCommandeId",
                table: "MouvementsStock",
                column: "LigneCommandeId");

            migrationBuilder.CreateIndex(
                name: "IX_MouvementsStock_ProduitId",
                table: "MouvementsStock",
                column: "ProduitId");

            migrationBuilder.CreateIndex(
                name: "IX_Produits_Nom",
                table: "Produits",
                column: "Nom",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommandeValidation");

            migrationBuilder.DropTable(
                name: "MouvementsStock");


            migrationBuilder.DropTable(
                name: "LignesCommandes");

            migrationBuilder.DropTable(
                name: "Commandes");

            migrationBuilder.DropTable(
                name: "Produits");

            migrationBuilder.DropTable(
                name: "Fournisseurs");
        }
    }
}
