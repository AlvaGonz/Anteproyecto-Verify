using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Add2FAColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_PlanSuscripcion_PlanSuscripcionIdsuscripcion",
                table: "Pagos");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_UsuariosLegacy_UsuarioLegacyIdUsuario",
                table: "Pagos");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_PlanSuscripcionIdsuscripcion",
                table: "Pagos");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_UsuarioLegacyIdUsuario",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "PlanSuscripcionIdsuscripcion",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "UsuarioLegacyIdUsuario",
                table: "Pagos");

            migrationBuilder.AlterColumn<decimal>(
                name: "Monto",
                table: "Pagos",
                type: "decimal(10,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaPago",
                table: "Pagos",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_Idsuscripcion",
                table: "Pagos",
                column: "Idsuscripcion");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_IdUsuario",
                table: "Pagos",
                column: "IdUsuario");

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_PlanSuscripcion_Idsuscripcion",
                table: "Pagos",
                column: "Idsuscripcion",
                principalTable: "PlanSuscripcion",
                principalColumn: "Idsuscripcion",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_UsuariosLegacy_IdUsuario",
                table: "Pagos",
                column: "IdUsuario",
                principalTable: "UsuariosLegacy",
                principalColumn: "IdUsuario",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_PlanSuscripcion_Idsuscripcion",
                table: "Pagos");

            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_UsuariosLegacy_IdUsuario",
                table: "Pagos");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_Idsuscripcion",
                table: "Pagos");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_IdUsuario",
                table: "Pagos");

            migrationBuilder.AlterColumn<decimal>(
                name: "Monto",
                table: "Pagos",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "FechaPago",
                table: "Pagos",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.AddColumn<Guid>(
                name: "PlanSuscripcionIdsuscripcion",
                table: "Pagos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UsuarioLegacyIdUsuario",
                table: "Pagos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_PlanSuscripcionIdsuscripcion",
                table: "Pagos",
                column: "PlanSuscripcionIdsuscripcion");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_UsuarioLegacyIdUsuario",
                table: "Pagos",
                column: "UsuarioLegacyIdUsuario");

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_PlanSuscripcion_PlanSuscripcionIdsuscripcion",
                table: "Pagos",
                column: "PlanSuscripcionIdsuscripcion",
                principalTable: "PlanSuscripcion",
                principalColumn: "Idsuscripcion");

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_UsuariosLegacy_UsuarioLegacyIdUsuario",
                table: "Pagos",
                column: "UsuarioLegacyIdUsuario",
                principalTable: "UsuariosLegacy",
                principalColumn: "IdUsuario");
        }
    }
}
