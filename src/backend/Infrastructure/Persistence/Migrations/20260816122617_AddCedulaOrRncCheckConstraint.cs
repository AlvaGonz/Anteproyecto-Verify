using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCedulaOrRncCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_Usuario_Cedula_Rnc",
                table: "Usuario",
                sql: "([Cedula] IS NOT NULL AND [Cedula] <> '') OR ([Rnc] IS NOT NULL AND [Rnc] <> '')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Usuario_Cedula_Rnc",
                table: "Usuario");
        }
    }
}
