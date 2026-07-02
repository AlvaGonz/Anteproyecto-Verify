using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionLimitsAndTeamSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MultiUsuario",
                table: "PlanSuscripcion");

            migrationBuilder.AddColumn<bool>(
                name: "AlertasTiempoRealDisponible",
                table: "PlanSuscripcion",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ExportacionExcelDisponible",
                table: "PlanSuscripcion",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ExportacionPdfDisponible",
                table: "PlanSuscripcion",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IntegracionCrmDisponible",
                table: "PlanSuscripcion",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxAlmacenamientoMb",
                table: "PlanSuscripcion",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MaxUsuariosSecundarios",
                table: "PlanSuscripcion",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "ModeloLmDisponible",
                table: "PlanSuscripcion",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SoporteTipo",
                table: "PlanSuscripcion",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Comunidad");

            migrationBuilder.AddColumn<bool>(
                name: "ValidacionLoteDisponible",
                table: "PlanSuscripcion",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ProyectosCreados",
                table: "Usuario",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "TitularId",
                table: "Usuario",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_TitularId",
                table: "Usuario",
                column: "TitularId");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuario_Usuario_TitularId",
                table: "Usuario",
                column: "TitularId",
                principalTable: "Usuario",
                principalColumn: "IdUsuario",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuario_Usuario_TitularId",
                table: "Usuario");

            migrationBuilder.DropIndex(
                name: "IX_Usuario_TitularId",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "AlertasTiempoRealDisponible",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "ExportacionExcelDisponible",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "ExportacionPdfDisponible",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "IntegracionCrmDisponible",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "MaxAlmacenamientoMb",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "MaxUsuariosSecundarios",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "ModeloLmDisponible",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "SoporteTipo",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "ValidacionLoteDisponible",
                table: "PlanSuscripcion");

            migrationBuilder.DropColumn(
                name: "ProyectosCreados",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "TitularId",
                table: "Usuario");

            migrationBuilder.AddColumn<bool>(
                name: "MultiUsuario",
                table: "PlanSuscripcion",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
