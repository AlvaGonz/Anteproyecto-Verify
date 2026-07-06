-- Seed for FremiunProyectos_Log
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'FE722B8B-F25F-4FEF-B180-C56154730E59')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('611FE7FD-C236-49BD-A761-9344B26657E2', 'FE722B8B-F25F-4FEF-B180-C56154730E59', 'Dummy Project', 'DUMMY-FE722', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('B30D2B59-4ACA-471C-B3D0-E5EB6E9113CB', '611FE7FD-C236-49BD-A761-9344B26657E2', 'FE722B8B-F25F-4FEF-B180-C56154730E59', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'F8BD9A4E-2FC6-4E4E-A125-4CBF67008D4D')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('F324D58D-509C-495B-84E3-71B2F1784301', 'F8BD9A4E-2FC6-4E4E-A125-4CBF67008D4D', 'Dummy Project', 'DUMMY-F8BD9', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('C036C01A-395C-4D60-9335-0B81C0D0B1C5', 'F324D58D-509C-495B-84E3-71B2F1784301', 'F8BD9A4E-2FC6-4E4E-A125-4CBF67008D4D', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'FB026E42-27A6-4540-BCE9-5DEFB80D013E')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('C9C3090D-6CAF-4E9F-B67B-F85C3DF8D8D0', 'FB026E42-27A6-4540-BCE9-5DEFB80D013E', 'Dummy Project', 'DUMMY-FB026', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('4A96125D-12C1-4B4A-B6C8-FBCADA92CAB5', 'C9C3090D-6CAF-4E9F-B67B-F85C3DF8D8D0', 'FB026E42-27A6-4540-BCE9-5DEFB80D013E', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '8097E120-6C2A-40FA-B36C-6496703833A5')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('7CC10D79-74D6-4473-B688-F414A39CAE91', '8097E120-6C2A-40FA-B36C-6496703833A5', 'Dummy Project', 'DUMMY-8097E', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('4E9BBF9A-2B90-4A57-B3CB-CE34DF324B30', '7CC10D79-74D6-4473-B688-F414A39CAE91', '8097E120-6C2A-40FA-B36C-6496703833A5', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'EDFE7FF0-FE0D-4C1A-877A-826D5761C9FD')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('F91C9BBE-F7CF-4555-93AA-3155DF3DD73E', 'EDFE7FF0-FE0D-4C1A-877A-826D5761C9FD', 'Dummy Project', 'DUMMY-EDFE7', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('5729030E-761B-430E-A842-14CD638467B0', 'F91C9BBE-F7CF-4555-93AA-3155DF3DD73E', 'EDFE7FF0-FE0D-4C1A-877A-826D5761C9FD', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'F20A26BB-F0DF-445B-9564-C924A87558C0')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('49ED8224-B995-4716-97F8-AD60091BA8F3', 'F20A26BB-F0DF-445B-9564-C924A87558C0', 'Dummy Project', 'DUMMY-F20A2', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('09E2BF5F-9650-4910-A012-EED58E225D38', '49ED8224-B995-4716-97F8-AD60091BA8F3', 'F20A26BB-F0DF-445B-9564-C924A87558C0', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '80294D9A-9A54-4163-B4F1-AA3B308D70E2')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('8BE0341F-A3C0-442E-BB30-2EFA94EA832F', '80294D9A-9A54-4163-B4F1-AA3B308D70E2', 'Dummy Project', 'DUMMY-80294', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('A70465C5-6974-48F9-B2E8-9076C1838E1A', '8BE0341F-A3C0-442E-BB30-2EFA94EA832F', '80294D9A-9A54-4163-B4F1-AA3B308D70E2', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '77FC696B-16B5-4A50-81C2-7A32BB16B929')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('4D81B9CF-08DE-4999-8896-F1FC48338402', '77FC696B-16B5-4A50-81C2-7A32BB16B929', 'Dummy Project', 'DUMMY-77FC6', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('3C6431F0-5395-4A23-8936-E8E5363D1F39', '4D81B9CF-08DE-4999-8896-F1FC48338402', '77FC696B-16B5-4A50-81C2-7A32BB16B929', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '219D7520-AFEE-4EA7-BAAF-E1927642E505')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('588F0BDB-D624-4F4C-88EA-D98A841824E2', '219D7520-AFEE-4EA7-BAAF-E1927642E505', 'Dummy Project', 'DUMMY-219D7', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('B6D6B53E-F974-4047-B7E2-3BFB7531451A', '588F0BDB-D624-4F4C-88EA-D98A841824E2', '219D7520-AFEE-4EA7-BAAF-E1927642E505', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '3B6C08A1-3E37-40D8-8B3D-BB5650B38BBA')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('9D74A60D-8D56-4B87-BA48-73EABA4918A5', '3B6C08A1-3E37-40D8-8B3D-BB5650B38BBA', 'Dummy Project', 'DUMMY-3B6C0', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('413D829D-8CC0-41F5-A659-4C5A2B4E0AAA', '9D74A60D-8D56-4B87-BA48-73EABA4918A5', '3B6C08A1-3E37-40D8-8B3D-BB5650B38BBA', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '998FBFCB-4388-450A-93B5-2E8E80879C6D')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('B3C5E748-7C59-4B10-839F-80558AD19AE9', '998FBFCB-4388-450A-93B5-2E8E80879C6D', 'Dummy Project', 'DUMMY-998FB', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('6A220687-D545-45DE-9C50-1A71706909F8', 'B3C5E748-7C59-4B10-839F-80558AD19AE9', '998FBFCB-4388-450A-93B5-2E8E80879C6D', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '530C7747-DFE6-4000-BEAB-89CBFCFBA5AA')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('F4CC1BA1-D52E-4000-A835-FFBED3DA3A3E', '530C7747-DFE6-4000-BEAB-89CBFCFBA5AA', 'Dummy Project', 'DUMMY-530C7', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('7CDC9417-4DC6-4D3F-AB73-4951642389B5', 'F4CC1BA1-D52E-4000-A835-FFBED3DA3A3E', '530C7747-DFE6-4000-BEAB-89CBFCFBA5AA', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '0076A632-D928-477D-9C96-8C428313E0D0')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('3BCDB4E9-9707-4FCB-B831-F3E5BD1FAB09', '0076A632-D928-477D-9C96-8C428313E0D0', 'Dummy Project', 'DUMMY-0076A', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('B814B96B-6757-4C0E-8C48-8CC04C34E87A', '3BCDB4E9-9707-4FCB-B831-F3E5BD1FAB09', '0076A632-D928-477D-9C96-8C428313E0D0', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '38D21093-DB45-4354-AD2E-C1FC36FBE30D')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('BE02016F-7060-4A7E-B9B1-B4EAE2A53C14', '38D21093-DB45-4354-AD2E-C1FC36FBE30D', 'Dummy Project', 'DUMMY-38D21', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('2A08954D-C9B5-4030-A86F-A31AECA321F1', 'BE02016F-7060-4A7E-B9B1-B4EAE2A53C14', '38D21093-DB45-4354-AD2E-C1FC36FBE30D', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '21C2D31F-7A44-49E2-8938-5986E8B93D78')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('94ACB745-8533-444D-9036-71BB4DC52D7C', '21C2D31F-7A44-49E2-8938-5986E8B93D78', 'Dummy Project', 'DUMMY-21C2D', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('14FCB522-242C-4354-AFF4-5C66EFC60C3E', '94ACB745-8533-444D-9036-71BB4DC52D7C', '21C2D31F-7A44-49E2-8938-5986E8B93D78', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '9873267E-7F8B-4AFA-B9ED-716885517CAB')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('CA0BC849-798E-4F1E-BFE8-C8534DE6CBB1', '9873267E-7F8B-4AFA-B9ED-716885517CAB', 'Dummy Project', 'DUMMY-98732', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('C8381682-8FA1-4627-83E2-D3BCA0D623D6', 'CA0BC849-798E-4F1E-BFE8-C8534DE6CBB1', '9873267E-7F8B-4AFA-B9ED-716885517CAB', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'FF363E44-BD10-4A73-90D5-08BC0F884ABC')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('5B7F4083-8583-4456-A06E-E1C3591CDE14', 'FF363E44-BD10-4A73-90D5-08BC0F884ABC', 'Dummy Project', 'DUMMY-FF363', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('2A6BB6F8-1C37-4324-93BF-7080C38E3B3B', '5B7F4083-8583-4456-A06E-E1C3591CDE14', 'FF363E44-BD10-4A73-90D5-08BC0F884ABC', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = 'EAD7DDC8-ECA7-4075-84FA-8BCBDF194F6B')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('A3090728-F4E9-4B55-87B9-7D811B8D171F', 'EAD7DDC8-ECA7-4075-84FA-8BCBDF194F6B', 'Dummy Project', 'DUMMY-EAD7D', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('0F055D55-AB1C-41B1-9480-936BB04A3935', 'A3090728-F4E9-4B55-87B9-7D811B8D171F', 'EAD7DDC8-ECA7-4075-84FA-8BCBDF194F6B', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '0E7A9417-DDBA-4002-8B4F-E09981506A81')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('2995D0E3-9402-43D5-AB9D-0869D6108466', '0E7A9417-DDBA-4002-8B4F-E09981506A81', 'Dummy Project', 'DUMMY-0E7A9', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('8408FDA0-699B-4173-A26A-1752A39A1ECB', '2995D0E3-9402-43D5-AB9D-0869D6108466', '0E7A9417-DDBA-4002-8B4F-E09981506A81', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '960C233D-7480-4BE8-A56E-05809282CCF5')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('E0A95362-FD62-4B6C-91E8-6255B16C0FCF', '960C233D-7480-4BE8-A56E-05809282CCF5', 'Dummy Project', 'DUMMY-960C2', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('AB44CB2D-FAE3-442C-8369-3F49245008B0', 'E0A95362-FD62-4B6C-91E8-6255B16C0FCF', '960C233D-7480-4BE8-A56E-05809282CCF5', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '9F9792A9-919C-40EF-8C16-595B95D4C9F9')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('6574C605-F26A-4DE2-862E-767DEBEFA37E', '9F9792A9-919C-40EF-8C16-595B95D4C9F9', 'Dummy Project', 'DUMMY-9F979', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('6CA94895-1672-4C73-8D75-AE63A8363F08', '6574C605-F26A-4DE2-862E-767DEBEFA37E', '9F9792A9-919C-40EF-8C16-595B95D4C9F9', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '2533BF4C-6970-418F-87D9-833549967C0A')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('89EAD076-D98F-4013-90B8-64352C32705D', '2533BF4C-6970-418F-87D9-833549967C0A', 'Dummy Project', 'DUMMY-2533B', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('04051E6B-E751-4379-893D-BBDDE1775F92', '89EAD076-D98F-4013-90B8-64352C32705D', '2533BF4C-6970-418F-87D9-833549967C0A', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '6FA5CD7D-1C8A-4E14-A546-6BC8ABFB0AE0')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('761683FC-6D8C-4568-A9D5-DCE93589C2FA', '6FA5CD7D-1C8A-4E14-A546-6BC8ABFB0AE0', 'Dummy Project', 'DUMMY-6FA5C', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('6C4D9277-A89B-4232-9EB0-434995B3CD4D', '761683FC-6D8C-4568-A9D5-DCE93589C2FA', '6FA5CD7D-1C8A-4E14-A546-6BC8ABFB0AE0', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '1F66027C-90C0-4E9D-8264-BFD258DEB122')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('251D3F73-E395-4EC3-AAA8-C4F62BE45665', '1F66027C-90C0-4E9D-8264-BFD258DEB122', 'Dummy Project', 'DUMMY-1F660', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('7514C1DC-59A0-4B67-9435-9033D353DF17', '251D3F73-E395-4EC3-AAA8-C4F62BE45665', '1F66027C-90C0-4E9D-8264-BFD258DEB122', GETDATE());
END
IF NOT EXISTS (SELECT 1 FROM ProyectosInmobiliarios WHERE IdUsuario = '4F7A4B78-6A0B-4FC3-A7BD-0B0A212A1371')
BEGIN
    INSERT INTO ProyectosInmobiliarios (IdProyecto, IdUsuario, NombreProyecto, CodigoInterno, UbicacionTexto, Categoria, Status, EstadoIntegridad, EstadoJuridico, SelladoBloqueado, CreatedAtUtc) VALUES ('836972CA-8EC0-4210-8AD6-E0BB0F123629', '4F7A4B78-6A0B-4FC3-A7BD-0B0A212A1371', 'Dummy Project', 'DUMMY-4F7A4', 'N/A', 1, 1, 1, 1, 0, GETUTCDATE());
    INSERT INTO FremiunProyectos_Log (IdProyectoLog, IdProyecto, IdUsuario, FechaAcceso) VALUES ('952BE2C4-09C7-448D-B09E-858C1931F56D', '836972CA-8EC0-4210-8AD6-E0BB0F123629', '4F7A4B78-6A0B-4FC3-A7BD-0B0A212A1371', GETDATE());
END
