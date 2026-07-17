using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProyectoEstadosAndMigrateData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProyectosEstados",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodigoUnico = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Condiciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ColorHex = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProyectosEstados", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProyectosEstados_CodigoUnico",
                table: "ProyectosEstados",
                column: "CodigoUnico",
                unique: true);

            var idCreado = Guid.NewGuid();
            var idEditado = Guid.NewGuid();
            var idRevision = Guid.NewGuid();
            var idObservacion = Guid.NewGuid();
            var idPublicado = Guid.NewGuid();
            var now = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");

            migrationBuilder.Sql($@"
                INSERT INTO ProyectosEstados (Id, CodigoUnico, Nombre, Descripcion, Condiciones, ColorHex, Activo, CreatedAtUtc)
                VALUES 
                ('{idCreado}', 'CREADO', 'Creado', 'Proyecto recién creado', 'El proyecto ha sido registrado en la plataforma.', '#9BACD8', 1, '{now}'),
                ('{idEditado}', 'EDITADO', 'Editado', 'Proyecto editado por el usuario', 'El proyecto ha sufrido modificaciones.', '#F98513', 1, '{now}'),
                ('{idRevision}', 'REVISION', 'En Revisión', 'El proyecto está siendo revisado', 'Se están verificando los documentos y datos.', '#EAB308', 1, '{now}'),
                ('{idObservacion}', 'OBSERVACION', 'Con Observación', 'El proyecto requiere atención', 'Se encontraron observaciones que deben corregirse.', '#EF4444', 1, '{now}'),
                ('{idPublicado}', 'PUBLICADO', 'Publicado', 'Proyecto validado y publicado', 'El proyecto ha completado su proceso y está publicado.', '#10B981', 1, '{now}');
            ");

            migrationBuilder.AddColumn<Guid>(
                name: "EstadoId",
                table: "ProyectosInmobiliarios",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: idCreado);

            migrationBuilder.Sql($@"
                UPDATE ProyectosInmobiliarios SET EstadoId = '{idCreado}';
            ");

            migrationBuilder.CreateIndex(
                name: "IX_ProyectosInmobiliarios_EstadoId",
                table: "ProyectosInmobiliarios",
                column: "EstadoId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProyectosInmobiliarios_ProyectosEstados_EstadoId",
                table: "ProyectosInmobiliarios",
                column: "EstadoId",
                principalTable: "ProyectosEstados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ProyectosInmobiliarios");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProyectosInmobiliarios_ProyectosEstados_EstadoId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropTable(
                name: "ProyectosEstados");

            migrationBuilder.DropIndex(
                name: "IX_ProyectosInmobiliarios_EstadoId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "EstadoId",
                table: "ProyectosInmobiliarios");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ProyectosInmobiliarios",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
