using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRowVersionAndEmailIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlertasValidacion_Proyectos_ProyectoId",
                table: "AlertasValidacion");

            migrationBuilder.DropForeignKey(
                name: "FK_Auditorias_Proyectos_ProyectoId",
                table: "Auditorias");

            migrationBuilder.DropForeignKey(
                name: "FK_Certificaciones_Proyectos_ProyectoId",
                table: "Certificaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_DeteccionesDuplicidad_Proyectos_ProyectoDuplicadoId",
                table: "DeteccionesDuplicidad");

            migrationBuilder.DropForeignKey(
                name: "FK_DeteccionesDuplicidad_Proyectos_ProyectoId",
                table: "DeteccionesDuplicidad");

            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_Proyectos_ProyectoId",
                table: "Documentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Hallazgos_Proyectos_ProyectoId",
                table: "Hallazgos");

            migrationBuilder.DropForeignKey(
                name: "FK_Proyectos_Usuario_UsuarioCreadorId",
                table: "Proyectos");

            migrationBuilder.DropForeignKey(
                name: "FK_Reportes_Proyectos_ProyectoId",
                table: "Reportes");

            migrationBuilder.DropForeignKey(
                name: "FK_ResultadosCrediticios_Proyectos_ProyectoId",
                table: "ResultadosCrediticios");

            migrationBuilder.DropForeignKey(
                name: "FK_SellosIntegridad_Proyectos_ProyectoId",
                table: "SellosIntegridad");

            migrationBuilder.DropForeignKey(
                name: "FK_Validaciones_Proyectos_ProyectoId",
                table: "Validaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_ValidacionesAyuntamiento_Proyectos_ProyectoId",
                table: "ValidacionesAyuntamiento");

            migrationBuilder.DropForeignKey(
                name: "FK_ValidacionesDgii_Proyectos_ProyectoId",
                table: "ValidacionesDgii");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Proyectos",
                table: "Proyectos");

            migrationBuilder.RenameTable(
                name: "Proyectos",
                newName: "ProyectosInmobiliarios");

            migrationBuilder.RenameColumn(
                name: "UsuarioCreadorId",
                table: "ProyectosInmobiliarios",
                newName: "IdUsuario");

            migrationBuilder.RenameColumn(
                name: "Nombre",
                table: "ProyectosInmobiliarios",
                newName: "NombreProyecto");

            migrationBuilder.RenameColumn(
                name: "EstadoProyecto",
                table: "ProyectosInmobiliarios",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "ProyectosInmobiliarios",
                newName: "IdProyecto");

            migrationBuilder.RenameIndex(
                name: "IX_Proyectos_UsuarioCreadorId",
                table: "ProyectosInmobiliarios",
                newName: "IX_ProyectosInmobiliarios_IdUsuario");

            migrationBuilder.RenameIndex(
                name: "IX_Proyectos_CodigoInterno",
                table: "ProyectosInmobiliarios",
                newName: "IX_ProyectosInmobiliarios_CodigoInterno");

            migrationBuilder.AlterColumn<string>(
                name: "TokenVerificacion",
                table: "Usuario",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "EmailVerificado",
                table: "Usuario",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "Activo",
                table: "Usuario",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Usuario",
                type: "rowversion",
                rowVersion: true,
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProyectosInmobiliarios",
                table: "ProyectosInmobiliarios",
                column: "IdProyecto");

            migrationBuilder.CreateTable(
                name: "DgiiRnc",
                columns: table => new
                {
                    Rnc = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NombreRazonSocial = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    NombreComercial = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Categoria = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RegimenPagos = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ActividadEconomica = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    AdministracionLocal = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FacturadorElectronico = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LicenciasVhm = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DgiiRnc", x => x.Rnc);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioLegacy_Email",
                table: "UsuarioLegacy",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AlertasValidacion_ProyectosInmobiliarios_ProyectoId",
                table: "AlertasValidacion",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Auditorias_ProyectosInmobiliarios_ProyectoId",
                table: "Auditorias",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Certificaciones_ProyectosInmobiliarios_ProyectoId",
                table: "Certificaciones",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoDuplicadoId",
                table: "DeteccionesDuplicidad",
                column: "ProyectoDuplicadoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto");

            migrationBuilder.AddForeignKey(
                name: "FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoId",
                table: "DeteccionesDuplicidad",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_ProyectosInmobiliarios_ProyectoId",
                table: "Documentos",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Hallazgos_ProyectosInmobiliarios_ProyectoId",
                table: "Hallazgos",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProyectosInmobiliarios_Usuario_IdUsuario",
                table: "ProyectosInmobiliarios",
                column: "IdUsuario",
                principalTable: "Usuario",
                principalColumn: "IdUsuario",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reportes_ProyectosInmobiliarios_ProyectoId",
                table: "Reportes",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ResultadosCrediticios_ProyectosInmobiliarios_ProyectoId",
                table: "ResultadosCrediticios",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SellosIntegridad_ProyectosInmobiliarios_ProyectoId",
                table: "SellosIntegridad",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Validaciones_ProyectosInmobiliarios_ProyectoId",
                table: "Validaciones",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ValidacionesAyuntamiento_ProyectosInmobiliarios_ProyectoId",
                table: "ValidacionesAyuntamiento",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ValidacionesDgii_ProyectosInmobiliarios_ProyectoId",
                table: "ValidacionesDgii",
                column: "ProyectoId",
                principalTable: "ProyectosInmobiliarios",
                principalColumn: "IdProyecto",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AlertasValidacion_ProyectosInmobiliarios_ProyectoId",
                table: "AlertasValidacion");

            migrationBuilder.DropForeignKey(
                name: "FK_Auditorias_ProyectosInmobiliarios_ProyectoId",
                table: "Auditorias");

            migrationBuilder.DropForeignKey(
                name: "FK_Certificaciones_ProyectosInmobiliarios_ProyectoId",
                table: "Certificaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoDuplicadoId",
                table: "DeteccionesDuplicidad");

            migrationBuilder.DropForeignKey(
                name: "FK_DeteccionesDuplicidad_ProyectosInmobiliarios_ProyectoId",
                table: "DeteccionesDuplicidad");

            migrationBuilder.DropForeignKey(
                name: "FK_Documentos_ProyectosInmobiliarios_ProyectoId",
                table: "Documentos");

            migrationBuilder.DropForeignKey(
                name: "FK_Hallazgos_ProyectosInmobiliarios_ProyectoId",
                table: "Hallazgos");

            migrationBuilder.DropForeignKey(
                name: "FK_ProyectosInmobiliarios_Usuario_IdUsuario",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropForeignKey(
                name: "FK_Reportes_ProyectosInmobiliarios_ProyectoId",
                table: "Reportes");

            migrationBuilder.DropForeignKey(
                name: "FK_ResultadosCrediticios_ProyectosInmobiliarios_ProyectoId",
                table: "ResultadosCrediticios");

            migrationBuilder.DropForeignKey(
                name: "FK_SellosIntegridad_ProyectosInmobiliarios_ProyectoId",
                table: "SellosIntegridad");

            migrationBuilder.DropForeignKey(
                name: "FK_Validaciones_ProyectosInmobiliarios_ProyectoId",
                table: "Validaciones");

            migrationBuilder.DropForeignKey(
                name: "FK_ValidacionesAyuntamiento_ProyectosInmobiliarios_ProyectoId",
                table: "ValidacionesAyuntamiento");

            migrationBuilder.DropForeignKey(
                name: "FK_ValidacionesDgii_ProyectosInmobiliarios_ProyectoId",
                table: "ValidacionesDgii");

            migrationBuilder.DropTable(
                name: "DgiiRnc");

            migrationBuilder.DropIndex(
                name: "IX_UsuarioLegacy_Email",
                table: "UsuarioLegacy");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProyectosInmobiliarios",
                table: "ProyectosInmobiliarios");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Usuario");

            migrationBuilder.RenameTable(
                name: "ProyectosInmobiliarios",
                newName: "Proyectos");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Proyectos",
                newName: "EstadoProyecto");

            migrationBuilder.RenameColumn(
                name: "NombreProyecto",
                table: "Proyectos",
                newName: "Nombre");

            migrationBuilder.RenameColumn(
                name: "IdUsuario",
                table: "Proyectos",
                newName: "UsuarioCreadorId");

            migrationBuilder.RenameColumn(
                name: "IdProyecto",
                table: "Proyectos",
                newName: "Id");

            migrationBuilder.RenameIndex(
                name: "IX_ProyectosInmobiliarios_IdUsuario",
                table: "Proyectos",
                newName: "IX_Proyectos_UsuarioCreadorId");

            migrationBuilder.RenameIndex(
                name: "IX_ProyectosInmobiliarios_CodigoInterno",
                table: "Proyectos",
                newName: "IX_Proyectos_CodigoInterno");

            migrationBuilder.AlterColumn<string>(
                name: "TokenVerificacion",
                table: "Usuario",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "EmailVerificado",
                table: "Usuario",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "Activo",
                table: "Usuario",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Proyectos",
                table: "Proyectos",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AlertasValidacion_Proyectos_ProyectoId",
                table: "AlertasValidacion",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Auditorias_Proyectos_ProyectoId",
                table: "Auditorias",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Certificaciones_Proyectos_ProyectoId",
                table: "Certificaciones",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DeteccionesDuplicidad_Proyectos_ProyectoDuplicadoId",
                table: "DeteccionesDuplicidad",
                column: "ProyectoDuplicadoId",
                principalTable: "Proyectos",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DeteccionesDuplicidad_Proyectos_ProyectoId",
                table: "DeteccionesDuplicidad",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Documentos_Proyectos_ProyectoId",
                table: "Documentos",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Hallazgos_Proyectos_ProyectoId",
                table: "Hallazgos",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Proyectos_Usuario_UsuarioCreadorId",
                table: "Proyectos",
                column: "UsuarioCreadorId",
                principalTable: "Usuario",
                principalColumn: "IdUsuario",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reportes_Proyectos_ProyectoId",
                table: "Reportes",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ResultadosCrediticios_Proyectos_ProyectoId",
                table: "ResultadosCrediticios",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SellosIntegridad_Proyectos_ProyectoId",
                table: "SellosIntegridad",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Validaciones_Proyectos_ProyectoId",
                table: "Validaciones",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ValidacionesAyuntamiento_Proyectos_ProyectoId",
                table: "ValidacionesAyuntamiento",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ValidacionesDgii_Proyectos_ProyectoId",
                table: "ValidacionesDgii",
                column: "ProyectoId",
                principalTable: "Proyectos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
