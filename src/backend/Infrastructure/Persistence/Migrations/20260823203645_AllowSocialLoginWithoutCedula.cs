using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AllowSocialLoginWithoutCedula : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Usuario_Cedula_Rnc",
                table: "Usuario");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Usuario_Cedula_Rnc",
                table: "Usuario",
                sql: "([SocialLogin] = 1) OR ([TitularId] IS NOT NULL) OR ([Cedula] IS NOT NULL AND [Cedula] <> '') OR ([Rnc] IS NOT NULL AND [Rnc] <> '')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_Usuario_Cedula_Rnc",
                table: "Usuario");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Usuario_Cedula_Rnc",
                table: "Usuario",
                sql: "([Cedula] IS NOT NULL AND [Cedula] <> '') OR ([Rnc] IS NOT NULL AND [Rnc] <> '')");
        }
    }
}
