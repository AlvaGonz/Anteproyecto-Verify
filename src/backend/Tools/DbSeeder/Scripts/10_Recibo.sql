SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '1F6B1A1C-E0C0-47EA-87C5-2807702A756D')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('1F6B1A1C-E0C0-47EA-87C5-2807702A756D', '3E11B16C-779D-47D4-BBD8-D9F42DA27BEF', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '54B38BDE-D74A-42D5-ACC1-FF4EADFB1773')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('54B38BDE-D74A-42D5-ACC1-FF4EADFB1773', '6B193467-B8BF-49B4-9D16-A7D05F3EA74C', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'ABD60D73-5BDA-4940-8CFC-62CDF71AB0A3')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('ABD60D73-5BDA-4940-8CFC-62CDF71AB0A3', 'C0847434-C635-4CEE-A8B2-DF15FE04F442', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '7BA6F073-FE13-4A95-81EA-8979862F27A9')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('7BA6F073-FE13-4A95-81EA-8979862F27A9', '0A616612-0A7E-42F8-9379-D5BFDB9AF66E', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '5F8CD24A-320E-4FF5-9191-D5F66FA49127')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('5F8CD24A-320E-4FF5-9191-D5F66FA49127', '17033205-8108-48E0-A2F7-D5CF3A892AEF', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'CAAF2A83-B208-4028-9211-68D6EB8E973A')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('CAAF2A83-B208-4028-9211-68D6EB8E973A', '19431EEC-9ED2-4BBF-8867-3E0CA72A3E26', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A7D9554C-D8D7-437B-8CE8-D6AC3C2D3EA1')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A7D9554C-D8D7-437B-8CE8-D6AC3C2D3EA1', '3098550E-0D63-4CBD-B448-FCCC5DCB58F5', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '56A1C8EA-5D56-4CCD-9124-77B5C6EB38D0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('56A1C8EA-5D56-4CCD-9124-77B5C6EB38D0', '86DE51B0-FABD-445C-82DC-CE178B71166E', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '74F85831-5684-4871-9362-266EB3247ACF')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('74F85831-5684-4871-9362-266EB3247ACF', '7F9EFD58-822A-4635-9E1D-355009F00505', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'DF26AB98-3FB0-4A88-8E20-51C444227000')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('DF26AB98-3FB0-4A88-8E20-51C444227000', '63CC18F5-8126-46D2-8563-6E4AF1B5D4A6', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '889457B8-3A71-4504-9B6F-DCE1FC6BD0A2')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('889457B8-3A71-4504-9B6F-DCE1FC6BD0A2', '95BC1FEF-1B28-4872-8D29-580E0E31E664', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2A2DD1FE-6F4B-46E1-A866-45BAD57C52CC')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2A2DD1FE-6F4B-46E1-A866-45BAD57C52CC', '9BE3A20E-EE92-4642-B53B-896F1D25D654', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '48E554BD-71E4-4261-A71D-775C7C5B6B84')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('48E554BD-71E4-4261-A71D-775C7C5B6B84', '574693FC-0A92-4477-BDC6-C2B48AB9ECE7', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'E2BB7E5B-E277-463B-9CD7-A58B583E153F')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('E2BB7E5B-E277-463B-9CD7-A58B583E153F', 'EE3457A7-187B-4F42-BEFC-F801C51FF4E9', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '3045FA3F-F85C-4FBC-8ABB-2A844AAC980E')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('3045FA3F-F85C-4FBC-8ABB-2A844AAC980E', '26679FA2-296E-467E-9BED-54CB8529C6A1', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '0CD12DE6-B94C-498B-B8FA-63445B381B5A')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('0CD12DE6-B94C-498B-B8FA-63445B381B5A', '51E59D12-1B79-4738-A2B7-23D2E104CF90', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'DD4B88C1-6CF7-433F-B34F-083F6DAB7712')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('DD4B88C1-6CF7-433F-B34F-083F6DAB7712', '5416AA79-FFA4-4719-A9D0-AD257619F885', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2AF82F7E-A986-4203-8FE7-99AF038C154E')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2AF82F7E-A986-4203-8FE7-99AF038C154E', '9C918ECD-0F71-4ABE-8966-5959E8EC6EA6', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '7DB1ECA2-4D5A-47F8-841F-A4631F32D621')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('7DB1ECA2-4D5A-47F8-841F-A4631F32D621', '638498A8-AF95-4FD3-A0AF-EB7B19B6B843', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '49FBDEB2-A159-409E-8838-F9D8011229F0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('49FBDEB2-A159-409E-8838-F9D8011229F0', 'AAE08A51-C087-464B-9B72-A31DE13A7E4B', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '5B489513-5D80-4D21-9D58-D49C1E2F17C1')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('5B489513-5D80-4D21-9D58-D49C1E2F17C1', '6DE3B590-4705-4A39-AB3E-24D6C101F9F2', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '8DD928FE-4DD2-444D-82F7-678B128C51FE')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('8DD928FE-4DD2-444D-82F7-678B128C51FE', 'CB643C02-A0AE-4A12-903A-24BD9DEA7820', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '5F85620A-6C33-419D-A9FC-3E7E4AD251A9')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('5F85620A-6C33-419D-A9FC-3E7E4AD251A9', '698FC6EC-EF4D-49AD-A6E8-F7D46E87564B', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'DBE9BEFC-532C-4CDA-82D4-AB0100C868C0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('DBE9BEFC-532C-4CDA-82D4-AB0100C868C0', '4724ED52-56E9-4759-8DA4-742D559EC23B', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A609CC73-D55B-4EC1-B5BB-6A7D0FE2E9E2')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A609CC73-D55B-4EC1-B5BB-6A7D0FE2E9E2', '181D9D34-D709-43D3-A181-8C9C0AABE399', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '876B04CC-2424-49DF-9B46-97A7976996BB')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('876B04CC-2424-49DF-9B46-97A7976996BB', '4C7D5747-F548-4125-BE3D-2E57289E9AB1', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A1575444-2FC4-4210-B1B3-744E95FC504F')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A1575444-2FC4-4210-B1B3-744E95FC504F', 'CCCC762B-4F80-44A3-A653-49B9FB154046', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2EA166FA-E689-44D1-926F-0AB5D8DACD74')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2EA166FA-E689-44D1-926F-0AB5D8DACD74', 'E6775DFB-966C-47D8-B378-65316A67B244', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'DD2EF0CE-A091-43DB-B59C-83FA56C61D14')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('DD2EF0CE-A091-43DB-B59C-83FA56C61D14', '89111195-C960-42D5-A81B-A3F3E6813E90', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '5132EE88-B7F9-4C6D-B41A-56CFF39A8570')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('5132EE88-B7F9-4C6D-B41A-56CFF39A8570', '8A9218B2-331A-47E2-9FDD-50FDF417065F', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'B10F67E9-DD6F-4528-A595-D57B81E2C809')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('B10F67E9-DD6F-4528-A595-D57B81E2C809', 'B1294E46-B3F3-41EC-9079-4FA3ABD1578F', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'BC31E0BE-82F2-4344-A819-344856743062')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('BC31E0BE-82F2-4344-A819-344856743062', 'A9845776-7068-41A4-A538-58451FA021FD', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'AAB85C6A-C006-412F-B7F1-893C4309A201')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('AAB85C6A-C006-412F-B7F1-893C4309A201', 'DFD0FE0A-3B32-456C-B3CB-ED2516B34EC0', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'F8029539-12E3-48D5-B025-2636358806E9')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('F8029539-12E3-48D5-B025-2636358806E9', '8B78DFAA-037B-4513-B790-2715CA71CBE2', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '924E2E9C-5BCB-40BF-B4D7-FB4C5C843D9A')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('924E2E9C-5BCB-40BF-B4D7-FB4C5C843D9A', '9C1793B9-DA7A-4E52-B8C7-B8755B48BE77', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '19D24D76-F85F-4FEA-84E4-80D05ACFEB23')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('19D24D76-F85F-4FEA-84E4-80D05ACFEB23', '33C0BF88-DCD1-4C44-81E9-88E2A549BB17', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '5D8346F3-56F2-43A6-94CC-023002232255')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('5D8346F3-56F2-43A6-94CC-023002232255', '18347BC6-9C7F-4D17-950A-C43818ABE2DC', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '0F1C86DB-9409-4DD5-96A2-3A3F25E643D0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('0F1C86DB-9409-4DD5-96A2-3A3F25E643D0', '8B0C02A5-D7D6-4ACB-8376-3A9092284E7C', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'EA251FF3-5B6D-4D7E-95CE-77B42A2F85BC')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('EA251FF3-5B6D-4D7E-95CE-77B42A2F85BC', '248290C7-56FD-4D15-9783-CFED5AAA3FF3', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '3634662D-31F8-4C11-A48E-8897835FE86F')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('3634662D-31F8-4C11-A48E-8897835FE86F', '28643B46-3315-4E7F-800D-5DA3408777B6', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'E0758FC0-F84E-4ABA-83F1-2C134DF0AC7E')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('E0758FC0-F84E-4ABA-83F1-2C134DF0AC7E', '99345132-2E8A-4230-B53C-81D7674D1EEE', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '27B06418-E30E-4F28-8D05-713BD768F6E9')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('27B06418-E30E-4F28-8D05-713BD768F6E9', '5117AAB2-9C61-47C7-B79C-47B2DA6BCAD6', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'D69343E4-E9DA-403C-84D3-8C294B566A34')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('D69343E4-E9DA-403C-84D3-8C294B566A34', '6EA646EB-C656-4B56-A916-42C33AA456BC', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '92A8375B-944F-40B5-8F31-40605EE95A49')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('92A8375B-944F-40B5-8F31-40605EE95A49', 'D0CC1B08-B687-407B-BF06-7DC3347C7E5B', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '816F1A3B-E1AA-4B0F-87E4-898CE71197CC')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('816F1A3B-E1AA-4B0F-87E4-898CE71197CC', '800741FD-C769-469A-9FDE-FED10EDE8396', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '9E63320C-8FB5-4FEF-9B41-F1EED0D78BA1')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('9E63320C-8FB5-4FEF-9B41-F1EED0D78BA1', '18C970B8-1D77-4AF8-8A27-484BCA055EF1', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '8AD66C94-939D-4981-94D5-8278586C3F88')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('8AD66C94-939D-4981-94D5-8278586C3F88', 'F21D8099-4291-4E73-95B3-FE7B903A0407', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'C44B450D-8C10-4C71-A4E7-93F7A76FFDB4')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('C44B450D-8C10-4C71-A4E7-93F7A76FFDB4', '43B822EA-0E95-4022-BFB2-2C381F1B9571', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'D0D759B6-8787-4348-B9B9-31DDE255ECA0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('D0D759B6-8787-4348-B9B9-31DDE255ECA0', 'A3F55613-307C-42D6-9234-434063036797', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '3B6DD60E-F826-44DD-B00D-5CCE948EE34A')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('3B6DD60E-F826-44DD-B00D-5CCE948EE34A', '04197202-A533-4C8D-A141-D47ABDA8D15C', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'C4F49F3C-7E73-4815-BE68-490AE7402C80')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('C4F49F3C-7E73-4815-BE68-490AE7402C80', '0D60B751-20E2-42F0-9E5B-C43D147FD767', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A00BE4A6-C4CE-430A-896B-7B6E10929B13')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A00BE4A6-C4CE-430A-896B-7B6E10929B13', '5E9B4EBD-6260-40C7-B361-D14EAFA67873', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '9033EA6E-0EF7-4307-9BF4-2315F04CB2A9')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('9033EA6E-0EF7-4307-9BF4-2315F04CB2A9', '7B68A689-FDD1-4C6A-897D-4E713915A45D', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '207F0DB0-A8B9-4505-A851-9613D509F46E')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('207F0DB0-A8B9-4505-A851-9613D509F46E', '4D86C640-F7AE-4491-9CA2-B69D25311AD3', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '0F05C243-2DCF-474F-A4AB-1DC041777AF1')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('0F05C243-2DCF-474F-A4AB-1DC041777AF1', '9CE33E0B-53F8-41CB-86D9-18F6E8578B12', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '7D53C1DA-E82B-462F-895A-6DA8AADAD311')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('7D53C1DA-E82B-462F-895A-6DA8AADAD311', '090D1DB5-8D64-41C1-9CC9-EED933EEA788', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'AD11C3C4-DDE8-4635-8A69-4075C73E3AAD')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('AD11C3C4-DDE8-4635-8A69-4075C73E3AAD', '86956639-E92D-44E2-9A8E-4E82E66DC07D', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '34440F6B-D9C4-47B6-B940-D799B1E958B2')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('34440F6B-D9C4-47B6-B940-D799B1E958B2', '2DE7B76D-3FBA-4C6C-8664-37A4B4CDAEE1', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'E419DCCE-43D5-4EBB-A0AC-3773AA9C96F3')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('E419DCCE-43D5-4EBB-A0AC-3773AA9C96F3', 'D8A865B9-038A-4991-8E93-9AE337F5A768', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'C42D52DA-9506-4C2C-AF9C-5963EE6BEDAE')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('C42D52DA-9506-4C2C-AF9C-5963EE6BEDAE', '3D715529-EFC9-425A-B18C-0F78DF8824E3', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '4F33A1ED-B57D-4406-9743-276D798296A0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('4F33A1ED-B57D-4406-9743-276D798296A0', '92EB4275-A3CF-4387-B348-C54F0AB66261', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2173B601-F6DE-4DF0-9502-5285409275DF')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2173B601-F6DE-4DF0-9502-5285409275DF', '23959FEA-08E6-44DC-A416-8E3F32A9C37D', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'AE9EDF20-396E-477D-881F-8D59903C9305')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('AE9EDF20-396E-477D-881F-8D59903C9305', '4CABC372-BA43-4476-B6AB-8372C68C718C', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '7A8B0ADF-F74D-4D99-9064-0BB7BC169F64')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('7A8B0ADF-F74D-4D99-9064-0BB7BC169F64', 'C8BFEC99-9C49-4CC1-841A-554AC9115BCB', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '3D0FCB72-9622-43C2-8268-E5365719A543')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('3D0FCB72-9622-43C2-8268-E5365719A543', '22405C7C-62A7-466E-9B68-FD9F5D78FCBE', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A968EB1A-46ED-457C-807A-6D55DE22A678')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A968EB1A-46ED-457C-807A-6D55DE22A678', '20DDCA56-2FD3-48C1-AC0F-7BB7F79441B0', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'CF8FF805-3178-4B49-951C-956172D26CC2')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('CF8FF805-3178-4B49-951C-956172D26CC2', '3B5AB264-24D6-4040-83F2-EBD4E7E20EB5', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '40F5D232-C901-4198-9502-8773B5BFF855')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('40F5D232-C901-4198-9502-8773B5BFF855', 'D9C90087-083E-4203-9E1F-20AB580E439F', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'AC08B9B4-FEF8-4EAE-AC5F-089295730146')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('AC08B9B4-FEF8-4EAE-AC5F-089295730146', 'F9825969-DCF9-4E28-AD4D-5CFA9D6EF637', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'FA7C96AC-162F-4739-A7A3-C781BD41C742')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('FA7C96AC-162F-4739-A7A3-C781BD41C742', '3E90E133-E9DB-42FF-A983-FFAD3DA10611', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '00CAA888-8C11-43C5-BC1F-8BEA110F05A0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('00CAA888-8C11-43C5-BC1F-8BEA110F05A0', '124F3FEE-2D43-436A-A8CC-2B4DA9565DA4', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'EC2724C1-DC9E-4517-9B13-5E77367460D2')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('EC2724C1-DC9E-4517-9B13-5E77367460D2', '60CE1AB6-401E-4530-8B6C-2C48C7BF8F3C', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '4423D7A6-C4D2-4B58-BB82-EF1E6230070D')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('4423D7A6-C4D2-4B58-BB82-EF1E6230070D', '85BA54AE-04EE-4D19-899C-AB3B6CE29F91', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '7569E027-BBD0-42E4-B7B0-FB63834DEB41')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('7569E027-BBD0-42E4-B7B0-FB63834DEB41', 'AA2D2AA2-5643-4C46-AAC8-5021AABD62B2', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '958649CD-2D15-42F9-873B-FAEF1DFC5A75')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('958649CD-2D15-42F9-873B-FAEF1DFC5A75', 'FCAE026F-DE3A-484D-8A29-1BD4BD4826C1', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
