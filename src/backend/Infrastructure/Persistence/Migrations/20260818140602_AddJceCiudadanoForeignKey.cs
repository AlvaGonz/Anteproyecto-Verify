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
            migrationBuilder.DropPrimaryKey(
                name: "PK_JCE_Ciudadano",
                table: "JCE_Ciudadano");

            migrationBuilder.AlterColumn<string>(
                name: "Cedula",
                table: "JCE_Ciudadano",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_JCE_Ciudadano",
                table: "JCE_Ciudadano",
                column: "Cedula");

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

            migrationBuilder.DropPrimaryKey(
                name: "PK_JCE_Ciudadano",
                table: "JCE_Ciudadano");

            migrationBuilder.AlterColumn<string>(
                name: "Cedula",
                table: "JCE_Ciudadano",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(15)",
                oldMaxLength: 15);

            migrationBuilder.AddPrimaryKey(
                name: "PK_JCE_Ciudadano",
                table: "JCE_Ciudadano",
                column: "Cedula");
        }
    }
}
