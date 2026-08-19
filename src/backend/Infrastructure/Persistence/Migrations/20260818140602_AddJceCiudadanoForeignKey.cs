using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJceCiudadanoForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Usuario_Cedula",
                table: "Usuario",
                column: "Cedula");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuario_JCE_Ciudadano_Cedula",
                table: "Usuario",
                column: "Cedula",
                principalTable: "JCE_Ciudadano",
                principalColumn: "Cedula",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuario_JCE_Ciudadano_Cedula",
                table: "Usuario");

            migrationBuilder.DropIndex(
                name: "IX_Usuario_Cedula",
                table: "Usuario");
        }
    }
}
