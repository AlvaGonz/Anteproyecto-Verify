using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeProjectCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Categoria",
                table: "ProyectosInmobiliarios",
                newName: "CategoriaId");

            migrationBuilder.CreateTable(
                name: "CategoriaProyecto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoriaProyecto", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProyectosInmobiliarios_CategoriaId",
                table: "ProyectosInmobiliarios",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_CategoriaProyecto_Nombre",
                table: "CategoriaProyecto",
                column: "Nombre",
                unique: true);

            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT CategoriaProyecto ON;
                INSERT INTO CategoriaProyecto (Id, Nombre, Descripcion, Activo, CreatedAt, UpdatedAt) VALUES 
                (1, 'ALBERGUES', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (2, 'ALMACENES', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (3, 'APARTAMENTOS', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (4, 'CENTROS DE RECREACIÓN Y DEPORTES', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (5, 'CENTROS DE SALUD', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (6, 'COLEGIOS Y CENTROS EDUCATIVOS', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (7, 'COMBINADOS', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (8, 'COMERCIAL Y OFICINAS', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (9, 'DEPÓSITOS', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (10, 'ESTACIÓN DE COMBUSTIBLE', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (11, 'ESTRUCTURAS ESPECIALES', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (12, 'HOSPEDAJE', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (13, 'OBRAS DE ORDEN SOCIAL', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (14, 'PARQUEOS', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (15, 'SERVICIOS DE TRANSPORTE', NULL, 1, GETUTCDATE(), GETUTCDATE()),
                (16, 'VIVIENDAS', NULL, 1, GETUTCDATE(), GETUTCDATE());
                SET IDENTITY_INSERT CategoriaProyecto OFF;

                UPDATE ProyectosInmobiliarios SET CategoriaId = CASE 
                    WHEN CategoriaId = 1 THEN 16 -- Residencial -> VIVIENDAS
                    WHEN CategoriaId = 2 THEN 8  -- Comercial -> COMERCIAL Y OFICINAS
                    WHEN CategoriaId = 3 THEN 12 -- Turístico -> HOSPEDAJE
                    WHEN CategoriaId = 4 THEN 7  -- Mixto -> COMBINADOS
                    WHEN CategoriaId = 99 THEN 11 -- Otro -> ESTRUCTURAS ESPECIALES
                    ELSE CategoriaId END;
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_ProyectosInmobiliarios_CategoriaProyecto_CategoriaId",
                table: "ProyectosInmobiliarios",
                column: "CategoriaId",
                principalTable: "CategoriaProyecto",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProyectosInmobiliarios_CategoriaProyecto_CategoriaId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropTable(
                name: "CategoriaProyecto");

            migrationBuilder.DropIndex(
                name: "IX_ProyectosInmobiliarios_CategoriaId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.RenameColumn(
                name: "CategoriaId",
                table: "ProyectosInmobiliarios",
                newName: "Categoria");
        }
    }
}
