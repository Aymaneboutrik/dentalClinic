using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Service_Rendez_vous.Migrations
{
    /// <inheritdoc />
    public partial class AddRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_rendezvous_statutid",
                table: "rendezvous",
                column: "statutid");

            migrationBuilder.CreateIndex(
                name: "IX_historiquerdv_rendezvousid",
                table: "historiquerdv",
                column: "rendezvousid");

            migrationBuilder.AddForeignKey(
                name: "fk_historiquerdv_rendezvous",
                table: "historiquerdv",
                column: "rendezvousid",
                principalTable: "rendezvous",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_rendezvous_statutrdv",
                table: "rendezvous",
                column: "statutid",
                principalTable: "statutrdv",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_historiquerdv_rendezvous",
                table: "historiquerdv");

            migrationBuilder.DropForeignKey(
                name: "fk_rendezvous_statutrdv",
                table: "rendezvous");

            migrationBuilder.DropIndex(
                name: "IX_rendezvous_statutid",
                table: "rendezvous");

            migrationBuilder.DropIndex(
                name: "IX_historiquerdv_rendezvousid",
                table: "historiquerdv");
        }
    }
}
