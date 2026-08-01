-- Seed for Dummy Projects and LogProyectos
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '2C5E0EB2-0F09-4030-9605-DF8E624E24E7')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('AEE1F0D9-69A1-4906-A4E7-E9287D42C6B2', '2C5E0EB2-0F09-4030-9605-DF8E624E24E7', 'Dummy Project 1', 'DUMMY-2C5E0', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('7CCF682D-C90F-4A4C-8C69-51BD15C50777', 'AEE1F0D9-69A1-4906-A4E7-E9287D42C6B2', '2C5E0EB2-0F09-4030-9605-DF8E624E24E7', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '8384DA90-37FE-4DD8-8043-B09CB1BDEFA2')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('D74ECC63-00E9-4195-A2FF-CA3A73ECF129', '8384DA90-37FE-4DD8-8043-B09CB1BDEFA2', 'Dummy Project 2', 'DUMMY-8384D', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('0C35193E-6553-4138-A7FD-4F8BF65DFDC8', 'D74ECC63-00E9-4195-A2FF-CA3A73ECF129', '8384DA90-37FE-4DD8-8043-B09CB1BDEFA2', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'CF849410-E809-4983-94CE-4363DD8EFCCE')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('93974E47-587C-4EF9-9475-60333C02A057', 'CF849410-E809-4983-94CE-4363DD8EFCCE', 'Dummy Project 3', 'DUMMY-CF849', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('093A1D8B-FCAF-45F2-A1F5-D082AE8B5BC1', '93974E47-587C-4EF9-9475-60333C02A057', 'CF849410-E809-4983-94CE-4363DD8EFCCE', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '296484B4-AA5E-4D46-8C9A-89C3531EA62B')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('FB39DD6A-D360-4AFA-9EBE-5873B1E34FAB', '296484B4-AA5E-4D46-8C9A-89C3531EA62B', 'Dummy Project 4', 'DUMMY-29648', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('A0A29119-5881-4726-A03F-9D79B1C446FE', 'FB39DD6A-D360-4AFA-9EBE-5873B1E34FAB', '296484B4-AA5E-4D46-8C9A-89C3531EA62B', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '38FB0A7D-3A81-4678-83E0-8F7D90E11B30')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('AB778BE8-DBCD-437C-A4C2-3A4CEE0106C2', '38FB0A7D-3A81-4678-83E0-8F7D90E11B30', 'Dummy Project 5', 'DUMMY-38FB0', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('A921EFE9-6005-43AE-B900-39C3E4A74CEA', 'AB778BE8-DBCD-437C-A4C2-3A4CEE0106C2', '38FB0A7D-3A81-4678-83E0-8F7D90E11B30', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '075E564A-B639-49D4-A0A7-2CD08626A298')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('1E24E9AD-C083-47C0-AA79-64A9EB0BD450', '075E564A-B639-49D4-A0A7-2CD08626A298', 'Dummy Project 6', 'DUMMY-075E5', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('70BFF933-F561-47F3-A8E0-5E106ACB8A7F', '1E24E9AD-C083-47C0-AA79-64A9EB0BD450', '075E564A-B639-49D4-A0A7-2CD08626A298', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '8A6DE7CF-785A-4402-80C4-B421F9DA5488')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('32641198-707F-4EBC-849A-3A144C89D71F', '8A6DE7CF-785A-4402-80C4-B421F9DA5488', 'Dummy Project 7', 'DUMMY-8A6DE', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('67DCCA94-48BE-436A-B028-55708AA57AA5', '32641198-707F-4EBC-849A-3A144C89D71F', '8A6DE7CF-785A-4402-80C4-B421F9DA5488', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '9DEED183-DBEB-4927-8B44-57BF6F0331CE')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('BF14806F-4861-4B31-B30D-8050999D53EB', '9DEED183-DBEB-4927-8B44-57BF6F0331CE', 'Dummy Project 8', 'DUMMY-9DEED', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('876EE212-E798-4921-BDE9-2E8673A703BE', 'BF14806F-4861-4B31-B30D-8050999D53EB', '9DEED183-DBEB-4927-8B44-57BF6F0331CE', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'F2F067F0-2542-4E8D-B2D4-B6547F785D0D')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('707213BB-3F6C-4D00-9B9D-533209DAEEDE', 'F2F067F0-2542-4E8D-B2D4-B6547F785D0D', 'Dummy Project 9', 'DUMMY-F2F06', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('9FC7373B-7BFD-4DC2-B771-8C64549BBCA9', '707213BB-3F6C-4D00-9B9D-533209DAEEDE', 'F2F067F0-2542-4E8D-B2D4-B6547F785D0D', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'B9ADB028-FCD9-47D9-9C22-D1951F99683D')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('175BE9BC-6C91-40DB-90B8-BBCE2F971325', 'B9ADB028-FCD9-47D9-9C22-D1951F99683D', 'Dummy Project 10', 'DUMMY-B9ADB', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('B69B4F9C-CD5F-4F98-A873-9E2727A5019E', '175BE9BC-6C91-40DB-90B8-BBCE2F971325', 'B9ADB028-FCD9-47D9-9C22-D1951F99683D', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'AAB47578-5E65-486A-930B-BCF0DAC89168')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('B679D4BA-12F4-4833-B169-0B60F44130EA', 'AAB47578-5E65-486A-930B-BCF0DAC89168', 'Dummy Project 11', 'DUMMY-AAB47', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('F485027A-2370-442D-8FAC-4540C93ADBA6', 'B679D4BA-12F4-4833-B169-0B60F44130EA', 'AAB47578-5E65-486A-930B-BCF0DAC89168', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '09F3096A-DC61-4FC6-A306-6FD54517001C')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('D4B9DD24-6458-43C8-A0CB-4BDA087523ED', '09F3096A-DC61-4FC6-A306-6FD54517001C', 'Dummy Project 12', 'DUMMY-09F30', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('8692FE0A-18B6-433D-8A1A-0CA4B48111D6', 'D4B9DD24-6458-43C8-A0CB-4BDA087523ED', '09F3096A-DC61-4FC6-A306-6FD54517001C', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '8B6A6EA2-0567-4957-BB4F-CFA98DB21BFC')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('8926E23A-3CAF-49F4-B319-2036E18609EB', '8B6A6EA2-0567-4957-BB4F-CFA98DB21BFC', 'Dummy Project 13', 'DUMMY-8B6A6', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('73A16CC3-1248-4950-BC1E-CF8DB2AE055B', '8926E23A-3CAF-49F4-B319-2036E18609EB', '8B6A6EA2-0567-4957-BB4F-CFA98DB21BFC', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'C188C5CD-0372-4EF6-8ABF-96F6770E8298')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('00BF9F3C-EFD0-4EEF-954F-2AD487D77B00', 'C188C5CD-0372-4EF6-8ABF-96F6770E8298', 'Dummy Project 14', 'DUMMY-C188C', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('1BB0CDA1-D06C-4A9E-8975-D3C0319BD42E', '00BF9F3C-EFD0-4EEF-954F-2AD487D77B00', 'C188C5CD-0372-4EF6-8ABF-96F6770E8298', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '959A3F4E-A7D0-42DD-AC8D-E17FB23FC02C')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('FCE6ABC3-747E-43BE-869A-B0EAB1F76462', '959A3F4E-A7D0-42DD-AC8D-E17FB23FC02C', 'Dummy Project 15', 'DUMMY-959A3', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('4927F275-36B0-4595-9B17-95DFF00BE4DE', 'FCE6ABC3-747E-43BE-869A-B0EAB1F76462', '959A3F4E-A7D0-42DD-AC8D-E17FB23FC02C', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'BC0C4C88-C0EA-4F77-8A95-207D6ABF6EB6')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('38512C44-D49A-4D74-9B25-C91A178F83FA', 'BC0C4C88-C0EA-4F77-8A95-207D6ABF6EB6', 'Dummy Project 16', 'DUMMY-BC0C4', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('E6843778-3EDB-4433-BF2E-648F1F6E8638', '38512C44-D49A-4D74-9B25-C91A178F83FA', 'BC0C4C88-C0EA-4F77-8A95-207D6ABF6EB6', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'EF506328-C18C-479C-B8AC-D5DE0A2A6D6A')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('EB9C02C4-0446-4608-82D5-BBCE4FF66F63', 'EF506328-C18C-479C-B8AC-D5DE0A2A6D6A', 'Dummy Project 17', 'DUMMY-EF506', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('F152D77F-7F0D-4E66-A953-E6E6038A8258', 'EB9C02C4-0446-4608-82D5-BBCE4FF66F63', 'EF506328-C18C-479C-B8AC-D5DE0A2A6D6A', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '845F7BDF-F4E3-4EE7-8BA5-95F36DDF568E')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('8EB94228-DEED-478F-9AB1-54899571D5D2', '845F7BDF-F4E3-4EE7-8BA5-95F36DDF568E', 'Dummy Project 18', 'DUMMY-845F7', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('146D4256-9E0C-49A9-8C3C-9C22C3DAE1B9', '8EB94228-DEED-478F-9AB1-54899571D5D2', '845F7BDF-F4E3-4EE7-8BA5-95F36DDF568E', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '1128A109-C906-43A5-A3C5-6F62DA63C2D8')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('F1F3CA9A-BB3F-4A24-94D0-E9A5AEFB26C1', '1128A109-C906-43A5-A3C5-6F62DA63C2D8', 'Dummy Project 19', 'DUMMY-1128A', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('91DC8D4C-852C-4B20-A7D7-D3A61C407839', 'F1F3CA9A-BB3F-4A24-94D0-E9A5AEFB26C1', '1128A109-C906-43A5-A3C5-6F62DA63C2D8', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '986A93A3-73AF-464D-BE11-658C21EBAC76')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('89257D63-E701-4518-9318-82B3825B0819', '986A93A3-73AF-464D-BE11-658C21EBAC76', 'Dummy Project 20', 'DUMMY-986A9', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('C63B20D6-C3BB-4C59-87EC-FEAB99D3834C', '89257D63-E701-4518-9318-82B3825B0819', '986A93A3-73AF-464D-BE11-658C21EBAC76', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '2F59A372-97A0-468B-8A21-0ACA78A3222F')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('20C069EA-7B6B-4BD9-8A73-E549A0644E26', '2F59A372-97A0-468B-8A21-0ACA78A3222F', 'Dummy Project 21', 'DUMMY-2F59A', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('B44250AB-66FC-40B4-8B11-FB3623438575', '20C069EA-7B6B-4BD9-8A73-E549A0644E26', '2F59A372-97A0-468B-8A21-0ACA78A3222F', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'A0159C99-46E7-4093-9660-C5F8C98B2EB9')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('CF8CCD21-426F-45A9-922C-EDE82AB7E329', 'A0159C99-46E7-4093-9660-C5F8C98B2EB9', 'Dummy Project 22', 'DUMMY-A0159', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('5CFD4E8A-B9E1-4234-86D2-BDAA9FA24C14', 'CF8CCD21-426F-45A9-922C-EDE82AB7E329', 'A0159C99-46E7-4093-9660-C5F8C98B2EB9', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'E5CCD3CB-0206-45BE-8288-E58D165D68E9')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('E57D2843-D419-4F66-B783-4C36DA88EF66', 'E5CCD3CB-0206-45BE-8288-E58D165D68E9', 'Dummy Project 23', 'DUMMY-E5CCD', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('46D1A030-ADF0-4127-A9D0-2F871639BED2', 'E57D2843-D419-4F66-B783-4C36DA88EF66', 'E5CCD3CB-0206-45BE-8288-E58D165D68E9', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'EAE3BFE0-DFC9-4EB7-8AE0-B5F2A8EC4C8D')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('E4813AD8-32DB-43FF-9AE4-43430451E768', 'EAE3BFE0-DFC9-4EB7-8AE0-B5F2A8EC4C8D', 'Dummy Project 24', 'DUMMY-EAE3B', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('B6B4C1E4-561C-4AF4-A3BB-02B702A5B9D5', 'E4813AD8-32DB-43FF-9AE4-43430451E768', 'EAE3BFE0-DFC9-4EB7-8AE0-B5F2A8EC4C8D', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'E09C4632-2BC3-4211-A043-8A989E21904A')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('5BDC376D-057C-4577-AB48-EBDA8EC4C521', 'E09C4632-2BC3-4211-A043-8A989E21904A', 'Dummy Project 25', 'DUMMY-E09C4', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('F38EB612-AF88-4080-9040-7942E30EAD4A', '5BDC376D-057C-4577-AB48-EBDA8EC4C521', 'E09C4632-2BC3-4211-A043-8A989E21904A', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '996E3A66-A9E0-4018-9386-9E2CF2D93645')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('E8F233E3-66D3-4765-AD26-C52E1C07DFA1', '996E3A66-A9E0-4018-9386-9E2CF2D93645', 'Dummy Project 26', 'DUMMY-996E3', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('801BE82D-FA2B-4E8C-ADBC-F85E292F1CDC', 'E8F233E3-66D3-4765-AD26-C52E1C07DFA1', '996E3A66-A9E0-4018-9386-9E2CF2D93645', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'A9A2D2BF-9493-4B5A-BCE7-3441BF48FCC0')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('5EE77B23-D019-49C2-95F1-D1DDA0807E82', 'A9A2D2BF-9493-4B5A-BCE7-3441BF48FCC0', 'Dummy Project 27', 'DUMMY-A9A2D', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('7CBC1534-6E49-4410-867E-D409EFEDCC70', '5EE77B23-D019-49C2-95F1-D1DDA0807E82', 'A9A2D2BF-9493-4B5A-BCE7-3441BF48FCC0', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '4991BD50-66EB-4960-99D9-71372518CC1B')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('9E04C890-BA46-44D0-A98A-CFF499D7AD0C', '4991BD50-66EB-4960-99D9-71372518CC1B', 'Dummy Project 28', 'DUMMY-4991B', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('7948DEC8-9497-4125-A0EA-64C97DE2E79A', '9E04C890-BA46-44D0-A98A-CFF499D7AD0C', '4991BD50-66EB-4960-99D9-71372518CC1B', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '728D3A0E-F30A-45E5-84A5-E7DCCC1CCD07')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('CC50A6F9-BD4D-4AE5-B6A6-E3838FCF6C97', '728D3A0E-F30A-45E5-84A5-E7DCCC1CCD07', 'Dummy Project 29', 'DUMMY-728D3', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('183358C7-CA9E-480A-B4FE-2AF62B9C5C79', 'CC50A6F9-BD4D-4AE5-B6A6-E3838FCF6C97', '728D3A0E-F30A-45E5-84A5-E7DCCC1CCD07', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'EA5910C0-EF2C-4967-97F8-2788469EC983')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('174809F9-38BC-4988-9A49-F32C89DBED39', 'EA5910C0-EF2C-4967-97F8-2788469EC983', 'Dummy Project 30', 'DUMMY-EA591', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('9655F204-6EA9-41D4-A6B1-D4059A119BF7', '174809F9-38BC-4988-9A49-F32C89DBED39', 'EA5910C0-EF2C-4967-97F8-2788469EC983', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '1DE1E717-C806-449A-9B54-A28E26BA8078')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('E0EE9D04-DA1E-4BA8-8E27-7754B7AC097F', '1DE1E717-C806-449A-9B54-A28E26BA8078', 'Dummy Project 31', 'DUMMY-1DE1E', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('4232BAEE-0D53-4BB1-992A-8105F973AEF5', 'E0EE9D04-DA1E-4BA8-8E27-7754B7AC097F', '1DE1E717-C806-449A-9B54-A28E26BA8078', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'BCF25042-2F19-4C4C-B841-F84E602BAC01')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('252AD190-9326-4A29-BC50-3C623CE03DA8', 'BCF25042-2F19-4C4C-B841-F84E602BAC01', 'Dummy Project 32', 'DUMMY-BCF25', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('F0464F71-59D5-48F3-86BB-7E70CFF07249', '252AD190-9326-4A29-BC50-3C623CE03DA8', 'BCF25042-2F19-4C4C-B841-F84E602BAC01', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'BDEBA221-CA20-4EEB-AC9F-95B895F2E510')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('B0C9C435-84CB-4F91-A024-5DC318EDAE02', 'BDEBA221-CA20-4EEB-AC9F-95B895F2E510', 'Dummy Project 33', 'DUMMY-BDEBA', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('522181DE-5C26-42CB-AE1F-1DCE611BD10F', 'B0C9C435-84CB-4F91-A024-5DC318EDAE02', 'BDEBA221-CA20-4EEB-AC9F-95B895F2E510', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '03A30E11-7993-4ABF-B3D7-5ED880755B44')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('3761ECA7-8C7A-400C-811F-3B9F2E5FAA27', '03A30E11-7993-4ABF-B3D7-5ED880755B44', 'Dummy Project 34', 'DUMMY-03A30', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('DF0F540B-1E91-4662-865A-D35EC329B62B', '3761ECA7-8C7A-400C-811F-3B9F2E5FAA27', '03A30E11-7993-4ABF-B3D7-5ED880755B44', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '17C8598A-E5B3-4125-940D-4556F6FC7C2A')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('9E7EC217-9D46-41BE-9A70-DAB779385FC2', '17C8598A-E5B3-4125-940D-4556F6FC7C2A', 'Dummy Project 35', 'DUMMY-17C85', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('177E77CC-6B60-455D-932E-21C267D7AE2A', '9E7EC217-9D46-41BE-9A70-DAB779385FC2', '17C8598A-E5B3-4125-940D-4556F6FC7C2A', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '77220801-5A87-4153-BC33-0E24F6DC82B8')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('F78B4BEC-7C81-4A88-B314-2C1B1D8D6702', '77220801-5A87-4153-BC33-0E24F6DC82B8', 'Dummy Project 36', 'DUMMY-77220', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('C7F8C24E-7004-4056-892E-EA3345812449', 'F78B4BEC-7C81-4A88-B314-2C1B1D8D6702', '77220801-5A87-4153-BC33-0E24F6DC82B8', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '81D958D2-2D72-419F-A3C0-C7C27FF0E7BC')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('F06F85D2-979D-4825-938E-A7E0782F74A0', '81D958D2-2D72-419F-A3C0-C7C27FF0E7BC', 'Dummy Project 37', 'DUMMY-81D95', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('D60DD7D0-2A23-4865-8EEE-58953C878206', 'F06F85D2-979D-4825-938E-A7E0782F74A0', '81D958D2-2D72-419F-A3C0-C7C27FF0E7BC', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'BD6AB453-F080-4E59-9452-A625762B3FC2')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('B971B17A-9734-4B5A-B18C-F4EC7E1CC025', 'BD6AB453-F080-4E59-9452-A625762B3FC2', 'Dummy Project 38', 'DUMMY-BD6AB', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('033CCFB4-4CCF-4AEC-BF0C-C3BBA7299058', 'B971B17A-9734-4B5A-B18C-F4EC7E1CC025', 'BD6AB453-F080-4E59-9452-A625762B3FC2', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'D8FA5C06-E858-4240-909B-3971A0168F09')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('2F6BA9E9-EA34-43DD-8FB2-F6FD50CF1950', 'D8FA5C06-E858-4240-909B-3971A0168F09', 'Dummy Project 39', 'DUMMY-D8FA5', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('95180594-729A-4931-83E9-1384830EEF6E', '2F6BA9E9-EA34-43DD-8FB2-F6FD50CF1950', 'D8FA5C06-E858-4240-909B-3971A0168F09', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '896E6980-1A9C-444E-A673-3B0F05CBF094')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('C5A8D3FF-ADC6-4276-A88D-E33030195B06', '896E6980-1A9C-444E-A673-3B0F05CBF094', 'Dummy Project 40', 'DUMMY-896E6', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('F90E8A51-1077-4238-A222-FCA67E710BD0', 'C5A8D3FF-ADC6-4276-A88D-E33030195B06', '896E6980-1A9C-444E-A673-3B0F05CBF094', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '72B4865B-460D-41BC-A5A2-E1AE113D7A47')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('B25ACBDF-8D4A-401F-8D68-B07D20C312DE', '72B4865B-460D-41BC-A5A2-E1AE113D7A47', 'Dummy Project 41', 'DUMMY-72B48', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('9363579B-B0B8-4A80-AB5A-6071C6820DE6', 'B25ACBDF-8D4A-401F-8D68-B07D20C312DE', '72B4865B-460D-41BC-A5A2-E1AE113D7A47', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'E8648A42-3A31-4D99-B2B1-93387D4EF8C1')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('0D560B54-A198-4B37-8A86-D43187DB7EEF', 'E8648A42-3A31-4D99-B2B1-93387D4EF8C1', 'Dummy Project 42', 'DUMMY-E8648', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('EBC84376-A40E-47DF-AD7F-2708308FF35E', '0D560B54-A198-4B37-8A86-D43187DB7EEF', 'E8648A42-3A31-4D99-B2B1-93387D4EF8C1', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'AC7613C0-0A20-410E-A3C5-76433651B08D')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('63D92D67-F7D0-470E-BB4C-507A563DBF2F', 'AC7613C0-0A20-410E-A3C5-76433651B08D', 'Dummy Project 43', 'DUMMY-AC761', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('82D3CEB3-24D1-44B9-89DE-F245CC5092F6', '63D92D67-F7D0-470E-BB4C-507A563DBF2F', 'AC7613C0-0A20-410E-A3C5-76433651B08D', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'E68FE080-1ED6-4067-B80C-0E5E7C841DB5')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('5895EE0A-C5FF-4015-916D-73E7316DFF8B', 'E68FE080-1ED6-4067-B80C-0E5E7C841DB5', 'Dummy Project 44', 'DUMMY-E68FE', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('390034F3-EC03-4EFC-A340-4405DD09D011', '5895EE0A-C5FF-4015-916D-73E7316DFF8B', 'E68FE080-1ED6-4067-B80C-0E5E7C841DB5', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '83532083-3109-419F-865F-B4A29C27F845')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('3AD85BAC-F39F-43A2-A946-745EC73F8074', '83532083-3109-419F-865F-B4A29C27F845', 'Dummy Project 45', 'DUMMY-83532', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('D0F16FE9-0CA5-4E32-A981-F438F183D3E0', '3AD85BAC-F39F-43A2-A946-745EC73F8074', '83532083-3109-419F-865F-B4A29C27F845', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '9F0DFEF1-D4BF-460E-BF35-135A81D5CA85')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('CC7E802C-CA6C-4EF1-B917-DD0E47274D90', '9F0DFEF1-D4BF-460E-BF35-135A81D5CA85', 'Dummy Project 46', 'DUMMY-9F0DF', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('2885E570-46CA-4853-B305-6CE96DD4D1FC', 'CC7E802C-CA6C-4EF1-B917-DD0E47274D90', '9F0DFEF1-D4BF-460E-BF35-135A81D5CA85', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '026BD6F7-79DF-4698-8C8A-A11AD5D48ACF')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('223B55E5-F61E-440E-926D-4AD1CAADC561', '026BD6F7-79DF-4698-8C8A-A11AD5D48ACF', 'Dummy Project 47', 'DUMMY-026BD', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('B6E8B017-4BB5-4D9B-8085-A2272772BCC0', '223B55E5-F61E-440E-926D-4AD1CAADC561', '026BD6F7-79DF-4698-8C8A-A11AD5D48ACF', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '6C8D614E-4CE8-4480-8BD1-CA4E4791BBC8')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('7F3D25D8-9897-4944-A2CE-48BF92158396', '6C8D614E-4CE8-4480-8BD1-CA4E4791BBC8', 'Dummy Project 48', 'DUMMY-6C8D6', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('1701BA70-686C-48EA-9264-83F747D07C51', '7F3D25D8-9897-4944-A2CE-48BF92158396', '6C8D614E-4CE8-4480-8BD1-CA4E4791BBC8', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '04D9D4FD-B3B1-431C-AB94-5EEF23BC055D')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('FB79D04B-71CD-4E0C-A8AC-568BBC5EE64E', '04D9D4FD-B3B1-431C-AB94-5EEF23BC055D', 'Dummy Project 49', 'DUMMY-04D9D', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('F99DA969-AFEF-4AE6-B24E-06D75EC453AC', 'FB79D04B-71CD-4E0C-A8AC-568BBC5EE64E', '04D9D4FD-B3B1-431C-AB94-5EEF23BC055D', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '1265D79D-9D35-4C32-B3CC-89A3B949EF8E')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('D3CD6F4F-0CA0-4E7D-97EA-3DD5565EA08A', '1265D79D-9D35-4C32-B3CC-89A3B949EF8E', 'Dummy Project 50', 'DUMMY-1265D', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('5217EEA4-DFDE-4D0E-89F5-776E0B39D870', 'D3CD6F4F-0CA0-4E7D-97EA-3DD5565EA08A', '1265D79D-9D35-4C32-B3CC-89A3B949EF8E', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '1DB71D4E-5A3D-4FC9-8575-0F04B31BE06B')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('7FE7278F-1EA8-4406-BDDE-E90926D432C2', '1DB71D4E-5A3D-4FC9-8575-0F04B31BE06B', 'Dummy Project 51', 'DUMMY-1DB71', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('BAEE29D4-35B2-4C3D-B768-3D3E186DD1F9', '7FE7278F-1EA8-4406-BDDE-E90926D432C2', '1DB71D4E-5A3D-4FC9-8575-0F04B31BE06B', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '24B7DD44-8F25-4106-A8CF-E97D918FBAF1')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('F7644A1C-7AFD-4E73-B99E-66D8BFFD45A0', '24B7DD44-8F25-4106-A8CF-E97D918FBAF1', 'Dummy Project 52', 'DUMMY-24B7D', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('A13C6430-F626-4B01-A2A4-616821F97660', 'F7644A1C-7AFD-4E73-B99E-66D8BFFD45A0', '24B7DD44-8F25-4106-A8CF-E97D918FBAF1', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '066FE386-52EE-49D1-A69E-F75D6BEAD469')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('2770EFF5-79BC-4538-B486-928663F5832A', '066FE386-52EE-49D1-A69E-F75D6BEAD469', 'Dummy Project 53', 'DUMMY-066FE', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('FA4AA31F-BE30-4036-ADE6-9C4BE74D591C', '2770EFF5-79BC-4538-B486-928663F5832A', '066FE386-52EE-49D1-A69E-F75D6BEAD469', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '66DB0821-53B3-4F21-B77E-584859B22198')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('B40E8145-707C-471E-962B-06F0002E9205', '66DB0821-53B3-4F21-B77E-584859B22198', 'Dummy Project 54', 'DUMMY-66DB0', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('D208AD8D-CE0E-484A-81A1-5B9D8E745286', 'B40E8145-707C-471E-962B-06F0002E9205', '66DB0821-53B3-4F21-B77E-584859B22198', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'AB916DDA-374F-4A9C-99FD-674E1E03BEEA')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('22913894-631C-4C8F-8394-44AEBD27ECE4', 'AB916DDA-374F-4A9C-99FD-674E1E03BEEA', 'Dummy Project 55', 'DUMMY-AB916', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('50E41116-F494-4E0F-87AE-2B98895BF89F', '22913894-631C-4C8F-8394-44AEBD27ECE4', 'AB916DDA-374F-4A9C-99FD-674E1E03BEEA', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '1721B58F-968E-4399-BB70-1F8BB0BBDFEA')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('7A8FAC39-134D-4521-A4AD-3078AA52B19B', '1721B58F-968E-4399-BB70-1F8BB0BBDFEA', 'Dummy Project 56', 'DUMMY-1721B', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('AFAD0CA0-A272-4CCA-A13C-A1DD0954BF66', '7A8FAC39-134D-4521-A4AD-3078AA52B19B', '1721B58F-968E-4399-BB70-1F8BB0BBDFEA', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '98882661-7979-4E9B-82C6-31B3E38299A7')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('9DD032DB-5AE7-420F-B0CE-260D4EABCBE9', '98882661-7979-4E9B-82C6-31B3E38299A7', 'Dummy Project 57', 'DUMMY-98882', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('40A90D7D-9313-4723-9F9B-23181239DC59', '9DD032DB-5AE7-420F-B0CE-260D4EABCBE9', '98882661-7979-4E9B-82C6-31B3E38299A7', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '0678AA83-AD23-4C6C-A780-BCEC36B7D7B4')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('29407022-2767-4EB9-895E-EB8C8A720BA0', '0678AA83-AD23-4C6C-A780-BCEC36B7D7B4', 'Dummy Project 58', 'DUMMY-0678A', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('E7B7A795-81EB-45DC-ABC2-D21B44B90696', '29407022-2767-4EB9-895E-EB8C8A720BA0', '0678AA83-AD23-4C6C-A780-BCEC36B7D7B4', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '9807DB33-0FE1-4FD1-8426-B8B103894586')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('CD16C91E-514F-4782-9F50-BE90394090D2', '9807DB33-0FE1-4FD1-8426-B8B103894586', 'Dummy Project 59', 'DUMMY-9807D', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('FD2A7C00-95B6-4E6E-B024-3238E8504712', 'CD16C91E-514F-4782-9F50-BE90394090D2', '9807DB33-0FE1-4FD1-8426-B8B103894586', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '17760077-1D2E-4EF8-B250-40E32894CD83')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, EstatusDescripcion, CreatedAtUtc) VALUES ('4C58FAF5-70D0-4A53-AB7D-B20AE04D7656', '17760077-1D2E-4EF8-B250-40E32894CD83', 'Dummy Project 60', 'DUMMY-17760', 'N/A', 1, 1, 1, 1, 0, 'Borrador', GETUTCDATE());
    INSERT INTO LogProyectos (Id, ProyectoId, UsuarioId, FechaCreacion, Detalle, CreatedAtUtc, UpdatedAtUtc) VALUES ('559C6287-8F23-4C2C-8CAC-2E0DACCA6192', '4C58FAF5-70D0-4A53-AB7D-B20AE04D7656', '17760077-1D2E-4EF8-B250-40E32894CD83', GETUTCDATE(), 'Proyecto dummy generado por seeder', GETUTCDATE(), GETUTCDATE());
END

