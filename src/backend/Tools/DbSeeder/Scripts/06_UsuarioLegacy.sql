-- Seed for UsuarioLegacy (inserting via the view or directly simulating legacy migration)
-- Since UsuarioLegacy is a view, inserting into it populates Usuario.
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'A8F8A78A-940C-40CF-8654-BF38E5D685AE')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('A8F8A78A-940C-40CF-8654-BF38E5D685AE', 'Legacy0', 'User0', 'legacy0@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '2529BBD4-B182-4926-B4CB-8EB91A5AA1AA')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('2529BBD4-B182-4926-B4CB-8EB91A5AA1AA', 'Legacy1', 'User1', 'legacy1@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '0CEBBC2A-050A-46D9-8B6C-C134E566C2BD')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('0CEBBC2A-050A-46D9-8B6C-C134E566C2BD', 'Legacy2', 'User2', 'legacy2@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '1BB7EA76-79CD-4EDC-907A-EA2D83C2F73D')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('1BB7EA76-79CD-4EDC-907A-EA2D83C2F73D', 'Legacy3', 'User3', 'legacy3@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '4878BE49-7F24-4FD7-9E9E-CB356A306DF6')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('4878BE49-7F24-4FD7-9E9E-CB356A306DF6', 'Legacy4', 'User4', 'legacy4@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
