using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixDisconnectedTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ReglasValidacion_CreadaPor",
                table: "ReglasValidacion",
                column: "CreadaPor");

            migrationBuilder.AddForeignKey(
                name: "FK_ReglasValidacion_Usuario_CreadaPor",
                table: "ReglasValidacion",
                column: "CreadaPor",
                principalTable: "Usuario",
                principalColumn: "IdUsuario",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReglasValidacion_Usuario_CreadaPor",
                table: "ReglasValidacion");

            migrationBuilder.DropIndex(
                name: "IX_ReglasValidacion_CreadaPor",
                table: "ReglasValidacion");
        }
    }
}
