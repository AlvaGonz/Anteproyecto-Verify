SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '615434E7-7AEE-43D8-87E9-DC382B0E9C93')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('615434E7-7AEE-43D8-87E9-DC382B0E9C93', '996E3A66-A9E0-4018-9386-9E2CF2D93645', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'EFFB179E-74AC-4AF4-89D7-72840097E19E')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('EFFB179E-74AC-4AF4-89D7-72840097E19E', 'A9A2D2BF-9493-4B5A-BCE7-3441BF48FCC0', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'CA69D260-C329-4380-A237-D42F71BE7DF0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('CA69D260-C329-4380-A237-D42F71BE7DF0', '4991BD50-66EB-4960-99D9-71372518CC1B', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '061F4528-893D-41C6-9605-A7608B1A55B1')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('061F4528-893D-41C6-9605-A7608B1A55B1', '728D3A0E-F30A-45E5-84A5-E7DCCC1CCD07', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '83FCE482-E2AA-42F9-9C82-84043773153C')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('83FCE482-E2AA-42F9-9C82-84043773153C', 'EA5910C0-EF2C-4967-97F8-2788469EC983', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'DFF67729-C78A-4194-977B-71FBE89358D9')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('DFF67729-C78A-4194-977B-71FBE89358D9', '1DE1E717-C806-449A-9B54-A28E26BA8078', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2833CBFB-744B-4F3E-A01D-25919FCB355D')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2833CBFB-744B-4F3E-A01D-25919FCB355D', 'BCF25042-2F19-4C4C-B841-F84E602BAC01', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '19EE95BF-7E79-43B6-98BA-D23DA07A360E')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('19EE95BF-7E79-43B6-98BA-D23DA07A360E', 'BDEBA221-CA20-4EEB-AC9F-95B895F2E510', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'B04A94AE-7918-4A79-BB60-A30F70CC5B71')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('B04A94AE-7918-4A79-BB60-A30F70CC5B71', '03A30E11-7993-4ABF-B3D7-5ED880755B44', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2A62EC03-0BD5-42A3-BE74-E4C3566464E3')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2A62EC03-0BD5-42A3-BE74-E4C3566464E3', '17C8598A-E5B3-4125-940D-4556F6FC7C2A', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'C67D3C54-FF54-43C6-83BD-23EE2F70CCF8')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('C67D3C54-FF54-43C6-83BD-23EE2F70CCF8', '77220801-5A87-4153-BC33-0E24F6DC82B8', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '65276F39-C264-4119-BEB4-B876B5E2030E')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('65276F39-C264-4119-BEB4-B876B5E2030E', '81D958D2-2D72-419F-A3C0-C7C27FF0E7BC', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'AC64B6B3-3DA0-4F33-94D3-A9382351C721')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('AC64B6B3-3DA0-4F33-94D3-A9382351C721', 'BD6AB453-F080-4E59-9452-A625762B3FC2', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '154E043E-2E31-4034-AB20-EC85237D0F8F')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('154E043E-2E31-4034-AB20-EC85237D0F8F', 'D8FA5C06-E858-4240-909B-3971A0168F09', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'FAF13A3C-8AB3-47E2-8CAE-65D37A687104')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('FAF13A3C-8AB3-47E2-8CAE-65D37A687104', '896E6980-1A9C-444E-A673-3B0F05CBF094', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'B0A268DD-077D-4DA8-8EF0-F07FA8261693')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('B0A268DD-077D-4DA8-8EF0-F07FA8261693', '72B4865B-460D-41BC-A5A2-E1AE113D7A47', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '155B786B-4415-42D0-B62C-011C6DACCA19')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('155B786B-4415-42D0-B62C-011C6DACCA19', 'E8648A42-3A31-4D99-B2B1-93387D4EF8C1', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A7B48ACC-107E-4322-B1BF-6E29165024FC')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A7B48ACC-107E-4322-B1BF-6E29165024FC', 'AC7613C0-0A20-410E-A3C5-76433651B08D', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'DDEACE48-4854-4449-A47C-435D3A65512B')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('DDEACE48-4854-4449-A47C-435D3A65512B', 'E68FE080-1ED6-4067-B80C-0E5E7C841DB5', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '031F43D4-73CA-40E3-95C4-54783E762641')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('031F43D4-73CA-40E3-95C4-54783E762641', '83532083-3109-419F-865F-B4A29C27F845', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A4D2C907-5598-4035-8E4A-E8122D961E3E')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A4D2C907-5598-4035-8E4A-E8122D961E3E', '9F0DFEF1-D4BF-460E-BF35-135A81D5CA85', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '9EA40AF0-275C-4A2B-9901-8C490C05C3A1')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('9EA40AF0-275C-4A2B-9901-8C490C05C3A1', '026BD6F7-79DF-4698-8C8A-A11AD5D48ACF', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '876E6928-929E-4D2B-B50C-43E4E4C9D310')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('876E6928-929E-4D2B-B50C-43E4E4C9D310', '6C8D614E-4CE8-4480-8BD1-CA4E4791BBC8', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '5E0D56BB-64C1-4F71-9F64-16548F0518B0')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('5E0D56BB-64C1-4F71-9F64-16548F0518B0', '04D9D4FD-B3B1-431C-AB94-5EEF23BC055D', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '41260746-042B-48B8-A9A5-2CAA44264F8C')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('41260746-042B-48B8-A9A5-2CAA44264F8C', '1265D79D-9D35-4C32-B3CC-89A3B949EF8E', 3500.0, GETDATE(), 'Suscripcion Profesional', 'Suscripcion', '{"subtotal":2870.0,"tax":630.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A14FE254-18D0-44C4-ABA1-94DFBB08C358')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A14FE254-18D0-44C4-ABA1-94DFBB08C358', '1DB71D4E-5A3D-4FC9-8575-0F04B31BE06B', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '42C7A3A2-D48D-4C91-9EEE-D2CCF9F63D0A')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('42C7A3A2-D48D-4C91-9EEE-D2CCF9F63D0A', '24B7DD44-8F25-4106-A8CF-E97D918FBAF1', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '235B01A9-B3A8-4265-B706-020F9A1443C3')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('235B01A9-B3A8-4265-B706-020F9A1443C3', '066FE386-52EE-49D1-A69E-F75D6BEAD469', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '238358C0-F0C8-4EC2-83D4-C8FD047CD30C')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('238358C0-F0C8-4EC2-83D4-C8FD047CD30C', '66DB0821-53B3-4F21-B77E-584859B22198', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '0987692D-1164-42F4-95E5-FB0F44BFED53')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('0987692D-1164-42F4-95E5-FB0F44BFED53', 'AB916DDA-374F-4A9C-99FD-674E1E03BEEA', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '814ACABC-EE64-4AE2-9D5C-B7EA6E157DE6')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('814ACABC-EE64-4AE2-9D5C-B7EA6E157DE6', '1721B58F-968E-4399-BB70-1F8BB0BBDFEA', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'C65B6DE1-07D7-4C9F-BB9F-A51551021B00')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('C65B6DE1-07D7-4C9F-BB9F-A51551021B00', '98882661-7979-4E9B-82C6-31B3E38299A7', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '03ED641A-4F4D-4F2C-B673-ABB0B97B3482')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('03ED641A-4F4D-4F2C-B673-ABB0B97B3482', '0678AA83-AD23-4C6C-A780-BCEC36B7D7B4', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '3BF2E767-4CD6-4805-AEBC-8AE8A7282086')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('3BF2E767-4CD6-4805-AEBC-8AE8A7282086', '9807DB33-0FE1-4FD1-8426-B8B103894586', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2477A33E-D219-4900-B7E4-5F20A7FA47ED')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2477A33E-D219-4900-B7E4-5F20A7FA47ED', '17760077-1D2E-4EF8-B250-40E32894CD83', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'E161AD30-B5A7-4C8C-A80B-429DEE4A7247')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('E161AD30-B5A7-4C8C-A80B-429DEE4A7247', '9206880C-D09A-473F-9507-F3D2442E4B09', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '09276828-1BDE-4D04-A3AD-A29B56D7F18F')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('09276828-1BDE-4D04-A3AD-A29B56D7F18F', '0C1ECDE5-4C38-47BD-987A-197FE80CA137', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '91855158-A347-48A9-855A-C748A8B98BC7')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('91855158-A347-48A9-855A-C748A8B98BC7', '6880031F-4E6D-477E-923D-BF20FC629E6C', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'E9F5117B-9987-4787-891C-322D0B6A21AB')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('E9F5117B-9987-4787-891C-322D0B6A21AB', '1C0E0617-D7DC-448E-97BC-270620162D80', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'EE517B6C-EA0B-404E-9FF3-9A88E57ED2B2')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('EE517B6C-EA0B-404E-9FF3-9A88E57ED2B2', '29D80C64-1E1B-461C-8D08-4C67E34D8C30', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'BF16CA68-0AC6-44BD-AC07-F0D6279E8968')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('BF16CA68-0AC6-44BD-AC07-F0D6279E8968', 'B00844E6-53FD-4C3C-B974-6989E441A066', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '818D2AD4-F77A-4DDF-B71F-9A88F9ABAE7B')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('818D2AD4-F77A-4DDF-B71F-9A88F9ABAE7B', '60DD6271-8996-4FBC-BA75-7FF9F58A07D8', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A00D532F-4D88-4A08-B9C3-30976DF55B20')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A00D532F-4D88-4A08-B9C3-30976DF55B20', 'EF5DD0A6-7A45-4594-93E4-5300246DD438', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A66ADA74-C142-43B6-B3BF-8F9CB713BBAC')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A66ADA74-C142-43B6-B3BF-8F9CB713BBAC', 'E848886D-CA7B-45E1-B351-D2C1EB24134C', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2E3619E6-1EFB-49E3-A0D0-4C83595A46F7')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2E3619E6-1EFB-49E3-A0D0-4C83595A46F7', '4AE57645-89B1-4D49-B08C-0A8B37A1F604', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '11AB619D-3418-45C6-829E-2EEBA3FF481D')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('11AB619D-3418-45C6-829E-2EEBA3FF481D', '0FE4B256-9BB2-441C-8CD7-F7DA0CA0D81A', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '2CFC63DF-0D85-4E20-AD17-25F20EF2D0B2')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('2CFC63DF-0D85-4E20-AD17-25F20EF2D0B2', 'B2FC8891-90A7-413E-9D71-58CBC602CF83', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'AF5F1FC6-59A6-47C1-BE96-03FE87446432')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('AF5F1FC6-59A6-47C1-BE96-03FE87446432', '2F12AB99-DB19-450D-8240-F8A6F34B2D8E', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'E75B373B-A680-47BC-BF21-1FBF8F4F4DE7')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('E75B373B-A680-47BC-BF21-1FBF8F4F4DE7', '64CE5962-F9DC-454A-9412-A5C215B457A7', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'B309DD96-F8B9-4FD1-B281-12535066C4C3')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('B309DD96-F8B9-4FD1-B281-12535066C4C3', 'A614E18C-7C18-40D2-B5DD-96F81D3FEB3B', 10000.0, GETDATE(), 'Suscripcion Empresa', 'Suscripcion', '{"subtotal":8200.0,"tax":1800.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'E39D0F2D-9763-4DC1-B57C-B8A806AB3E65')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('E39D0F2D-9763-4DC1-B57C-B8A806AB3E65', '422F9FED-8D42-4C5B-9F72-F3EEA923460F', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'B62B6A56-41CC-41D3-A662-F5C09AFF0744')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('B62B6A56-41CC-41D3-A662-F5C09AFF0744', 'FE3A200B-6E9D-415C-82C0-0321318D0E3E', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '7DBB4C1F-21A8-4421-B9D8-D777C377ADAB')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('7DBB4C1F-21A8-4421-B9D8-D777C377ADAB', 'EF57507F-6BA1-4D47-92A5-20D5EFA6ADA8', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '8CB1C932-5B39-40D6-A2D6-2FB8F3C5467A')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('8CB1C932-5B39-40D6-A2D6-2FB8F3C5467A', '35ABB853-3A98-4098-A3FD-35A626D228EB', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '7B1903A3-AB04-4657-A080-4F4A7CBE03D6')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('7B1903A3-AB04-4657-A080-4F4A7CBE03D6', 'EC2EB1EE-0AF7-442A-B2A8-73464E5A8F9F', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '0649AFE9-78B1-44B1-8A10-8EA26FFBAECC')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('0649AFE9-78B1-44B1-8A10-8EA26FFBAECC', '3F75E2DE-6EDE-4489-9ADB-E1097D8250E5', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'B0B9307A-6B83-416E-93DA-3ABCF40A1125')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('B0B9307A-6B83-416E-93DA-3ABCF40A1125', '81806519-52BB-4BAB-B8B0-9A853AB79CE4', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '58D4132D-E928-4404-B30F-68DFD8A2E8CC')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('58D4132D-E928-4404-B30F-68DFD8A2E8CC', '280260E8-A791-46CA-A09A-62D2D25D7525', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A6C62845-2EEA-4733-A522-A9CD5499FA29')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A6C62845-2EEA-4733-A522-A9CD5499FA29', '81C1D5D0-07E3-4C9E-B05F-9C8F17DA1977', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '4141C284-6F24-4EC9-9F8C-6B7679DA4F13')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('4141C284-6F24-4EC9-9F8C-6B7679DA4F13', '40A9C329-1089-406C-9853-23A5AD598B20', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'AA786DC7-C5E7-49F1-915E-640AAF3F5C82')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('AA786DC7-C5E7-49F1-915E-640AAF3F5C82', '2E8EA371-7BC1-4A53-AAE4-3CB317F23759', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '224B144A-23E0-4CC6-9198-64E4C2232601')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('224B144A-23E0-4CC6-9198-64E4C2232601', '2BEF201D-49AE-4CD1-8423-0BFA186830D9', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '4785A69F-49B9-467C-81F8-E65F2D46FEC6')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('4785A69F-49B9-467C-81F8-E65F2D46FEC6', 'A0A227EE-74B2-47B0-98A0-108D619C8C43', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '5F76BA8F-A34B-42BB-86A2-BC3F08007757')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('5F76BA8F-A34B-42BB-86A2-BC3F08007757', '569D49EF-C16C-478A-9D40-E0338BC3CF58', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '053A8406-59C8-4B8D-A959-4074B10994BF')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('053A8406-59C8-4B8D-A959-4074B10994BF', '4391F3B8-283A-43B5-B5F9-76E14383ADE6', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'D2FC662D-271F-4E85-BA2D-0FDB4D39D3A5')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('D2FC662D-271F-4E85-BA2D-0FDB4D39D3A5', '8220CD16-6425-4DA0-B230-83D21B9797C0', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'A1BF6781-4378-4DFF-8DAE-B9763ED85337')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('A1BF6781-4378-4DFF-8DAE-B9763ED85337', '67BD675B-6A79-426F-BB1B-C3CA4735BA07', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '85CBBC69-E57E-40E9-8272-B6D772FA63C8')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('85CBBC69-E57E-40E9-8272-B6D772FA63C8', 'C3392BDA-88A3-4E20-A313-9C17784B66AA', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'F6D91879-D0DE-4040-846F-28D72075EDE8')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('F6D91879-D0DE-4040-846F-28D72075EDE8', '70FAC0FB-D0B7-4C50-A3D3-FEC351EE7397', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '7F2F6E6D-5C10-4485-83FD-0C3D5EB7994D')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('7F2F6E6D-5C10-4485-83FD-0C3D5EB7994D', '75675B76-B795-4C08-B719-D3CA736AED2F', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '1B3B5238-5770-463A-B80E-E1369FAB9E49')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('1B3B5238-5770-463A-B80E-E1369FAB9E49', '5529D67E-5B1C-4BC8-B3E7-0CFD14659F59', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '4FC1491A-696F-45BE-AFC8-9FFEC370A3EC')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('4FC1491A-696F-45BE-AFC8-9FFEC370A3EC', '6C443E86-255E-4E73-ACF6-66874310CC08', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '616F8313-1BE2-4C41-AD76-939A1C712214')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('616F8313-1BE2-4C41-AD76-939A1C712214', 'AD340E30-9DE5-4940-AB37-016E4DB2553F', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = '8BE004D9-25C7-4A49-9B9A-320980D4C579')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('8BE004D9-25C7-4A49-9B9A-320980D4C579', '21CCF0C2-3751-41A4-AB2F-CB5490DEDB75', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
IF NOT EXISTS (SELECT 1 FROM Recibo WHERE IdPago = 'DED68F16-2E86-4890-9F92-60964F5C5E2F')
INSERT INTO Recibo (IdPago, IdUsuario, Monto, FechaPago, Detalle, Categoria, Desglose) VALUES ('DED68F16-2E86-4890-9F92-60964F5C5E2F', '1D35FD41-03BC-485E-9040-4F17DC77E103', 30000.0, GETDATE(), 'Suscripcion Corporativo', 'Suscripcion', '{"subtotal":24600.0,"tax":5400.0}');
