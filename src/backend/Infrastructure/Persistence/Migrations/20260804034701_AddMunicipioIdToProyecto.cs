using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    public partial class AddMunicipioIdToProyecto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the Municipio FK that was added in the previous run
            migrationBuilder.DropForeignKey(
                name: "FK_ProyectosInmobiliarios_Municipio_MunicipioId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropIndex(
                name: "IX_ProyectosInmobiliarios_MunicipioId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "MunicipioId",
                table: "ProyectosInmobiliarios");

            // Add Provincia FK
            migrationBuilder.AddColumn<Guid>(
                name: "ProvinciaId",
                table: "ProyectosInmobiliarios",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProyectosInmobiliarios_ProvinciaId",
                table: "ProyectosInmobiliarios",
                column: "ProvinciaId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProyectosInmobiliarios_Provincia_ProvinciaId",
                table: "ProyectosInmobiliarios",
                column: "ProvinciaId",
                principalTable: "Provincia",
                principalColumn: "IdProvincia");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProyectosInmobiliarios_Provincia_ProvinciaId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropIndex(
                name: "IX_ProyectosInmobiliarios_ProvinciaId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "ProvinciaId",
                table: "ProyectosInmobiliarios");

            // Restore Municipio FK in Down
            migrationBuilder.AddColumn<Guid>(
                name: "MunicipioId",
                table: "ProyectosInmobiliarios",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProyectosInmobiliarios_MunicipioId",
                table: "ProyectosInmobiliarios",
                column: "MunicipioId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProyectosInmobiliarios_Municipio_MunicipioId",
                table: "ProyectosInmobiliarios",
                column: "MunicipioId",
                principalTable: "Municipio",
                principalColumn: "IdMunicipio");
        }
    }
}
