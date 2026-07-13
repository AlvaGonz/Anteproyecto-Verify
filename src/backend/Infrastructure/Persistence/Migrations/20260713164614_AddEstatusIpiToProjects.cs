using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEstatusIpiToProjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NombreCompleto",
                table: "UsuarioLegacy");

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetToken",
                table: "Usuario",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetTokenExpiraUtc",
                table: "Usuario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EstatusIpi",
                table: "ProyectosInmobiliarios",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiraUtc",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "EstatusIpi",
                table: "ProyectosInmobiliarios");

            migrationBuilder.AddColumn<string>(
                name: "NombreCompleto",
                table: "UsuarioLegacy",
                type: "nvarchar(max)",
                nullable: false,
                computedColumnSql: "[Nombre] + ' ' + [Apellido]",
                stored: true);
        }
    }
}
