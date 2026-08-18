using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGovernmentEntitiesForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "PermisoSuelo",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.DropPrimaryKey(
                name: "PK_PagoIPI",
                table: "PagoIPI");

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "PagoIPI",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PagoIPI",
                table: "PagoIPI",
                column: "Rnc");

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "LicenciaConstruccion",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "DGII",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "CatastroTitulo",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            // Impute Rnc in LicenciaConstruccion by matching Provincia and Municipio with CatastroTitulo
            migrationBuilder.Sql(@"
                UPDATE lc
                SET lc.Rnc = c.Rnc,
                    lc.NombreRazonSocial = d.NombreRazonSocial
                FROM LicenciaConstruccion lc
                CROSS APPLY (
                    SELECT TOP 1 c.Rnc
                    FROM CatastroTitulo c
                    WHERE c.Provincia = lc.Provincia AND c.Municipio = lc.Municipio AND c.Rnc IS NOT NULL
                ) c
                INNER JOIN DGII d ON c.Rnc = d.Rnc
                WHERE lc.Rnc IS NULL OR lc.Rnc = '';
            ");

            migrationBuilder.CreateIndex(
                name: "IX_PermisoSuelo_Rnc",
                table: "PermisoSuelo",
                column: "Rnc");

            migrationBuilder.CreateIndex(
                name: "IX_LicenciaConstruccion_Rnc",
                table: "LicenciaConstruccion",
                column: "Rnc");

            migrationBuilder.CreateIndex(
                name: "IX_CatastroTitulo_Rnc",
                table: "CatastroTitulo",
                column: "Rnc");

            migrationBuilder.AddForeignKey(
                name: "FK_CatastroTitulo_DGII_Rnc",
                table: "CatastroTitulo",
                column: "Rnc",
                principalTable: "DGII",
                principalColumn: "Rnc",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LicenciaConstruccion_DGII_Rnc",
                table: "LicenciaConstruccion",
                column: "Rnc",
                principalTable: "DGII",
                principalColumn: "Rnc",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PagoIPI_DGII_Rnc",
                table: "PagoIPI",
                column: "Rnc",
                principalTable: "DGII",
                principalColumn: "Rnc",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PermisoSuelo_DGII_Rnc",
                table: "PermisoSuelo",
                column: "Rnc",
                principalTable: "DGII",
                principalColumn: "Rnc",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CatastroTitulo_DGII_Rnc",
                table: "CatastroTitulo");

            migrationBuilder.DropForeignKey(
                name: "FK_LicenciaConstruccion_DGII_Rnc",
                table: "LicenciaConstruccion");

            migrationBuilder.DropForeignKey(
                name: "FK_PagoIPI_DGII_Rnc",
                table: "PagoIPI");

            migrationBuilder.DropForeignKey(
                name: "FK_PermisoSuelo_DGII_Rnc",
                table: "PermisoSuelo");

            migrationBuilder.DropIndex(
                name: "IX_PermisoSuelo_Rnc",
                table: "PermisoSuelo");

            migrationBuilder.DropIndex(
                name: "IX_LicenciaConstruccion_Rnc",
                table: "LicenciaConstruccion");

            migrationBuilder.DropIndex(
                name: "IX_CatastroTitulo_Rnc",
                table: "CatastroTitulo");

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "PermisoSuelo",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.DropPrimaryKey(
                name: "PK_PagoIPI",
                table: "PagoIPI");

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "PagoIPI",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PagoIPI",
                table: "PagoIPI",
                column: "Rnc");

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "LicenciaConstruccion",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "DGII",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Rnc",
                table: "CatastroTitulo",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);
        }
    }
}
