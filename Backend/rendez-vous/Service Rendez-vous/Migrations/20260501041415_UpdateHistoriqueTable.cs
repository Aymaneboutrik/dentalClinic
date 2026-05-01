using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Service_Rendez_vous.Migrations
{
    /// <inheritdoc />
    public partial class UpdateHistoriqueTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_historiquerdv_rendezvous",
                table: "historiquerdv");

            migrationBuilder.AlterColumn<int>(
                name: "rendezvousid",
                table: "historiquerdv",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "modifiepar",
                table: "historiquerdv",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "date",
                table: "historiquerdv",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "dentisteid",
                table: "historiquerdv",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "esturgent",
                table: "historiquerdv",
                type: "boolean",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "heuredebut",
                table: "historiquerdv",
                type: "time without time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "motif",
                table: "historiquerdv",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "patientid",
                table: "historiquerdv",
                type: "integer",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_historiquerdv_rendezvous",
                table: "historiquerdv",
                column: "rendezvousid",
                principalTable: "rendezvous",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_historiquerdv_rendezvous",
                table: "historiquerdv");

            migrationBuilder.DropColumn(
                name: "date",
                table: "historiquerdv");

            migrationBuilder.DropColumn(
                name: "dentisteid",
                table: "historiquerdv");

            migrationBuilder.DropColumn(
                name: "esturgent",
                table: "historiquerdv");

            migrationBuilder.DropColumn(
                name: "heuredebut",
                table: "historiquerdv");

            migrationBuilder.DropColumn(
                name: "motif",
                table: "historiquerdv");

            migrationBuilder.DropColumn(
                name: "patientid",
                table: "historiquerdv");

            migrationBuilder.AlterColumn<int>(
                name: "rendezvousid",
                table: "historiquerdv",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "modifiepar",
                table: "historiquerdv",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_historiquerdv_rendezvous",
                table: "historiquerdv",
                column: "rendezvousid",
                principalTable: "rendezvous",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
