-- Seed for UsuarioLegacy (inserting via the view or directly simulating legacy migration)
-- Since UsuarioLegacy is a view, inserting into it populates Usuario.
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '7A64E5B4-B2E2-4D2D-B54E-99DF82C96FE9')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('7A64E5B4-B2E2-4D2D-B54E-99DF82C96FE9', 'Legacy0', 'User0', 'legacy0@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'B598FC44-B909-46D2-8E22-1FD15BDA3CE0')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('B598FC44-B909-46D2-8E22-1FD15BDA3CE0', 'Legacy1', 'User1', 'legacy1@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'D41D6566-4868-47A5-AD5D-DE26CF7E6A3A')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('D41D6566-4868-47A5-AD5D-DE26CF7E6A3A', 'Legacy2', 'User2', 'legacy2@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '2923B33D-47CD-4C1D-9A94-1120C22592D0')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('2923B33D-47CD-4C1D-9A94-1120C22592D0', 'Legacy3', 'User3', 'legacy3@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '40D34B87-F7FE-4FF3-A457-D6A18CC22BA3')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('40D34B87-F7FE-4FF3-A457-D6A18CC22BA3', 'Legacy4', 'User4', 'legacy4@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '5F1F3417-402F-4CAC-AE39-F9802A5E72D2', GETUTCDATE(), GETUTCDATE(), 0);
