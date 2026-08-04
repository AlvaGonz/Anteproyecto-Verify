using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    public partial class AddMunicipioIdToProyecto : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Provincia and Municipio tables already exist (seeded via raw SQL)
            // Only add the FK column to ProyectosInmobiliarios

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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProyectosInmobiliarios_Municipio_MunicipioId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropIndex(
                name: "IX_ProyectosInmobiliarios_MunicipioId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "MunicipioId",
                table: "ProyectosInmobiliarios");
        }
    }
}
