-- Seed for UsuarioLegacy (inserting via the view or directly simulating legacy migration)
-- Since UsuarioLegacy is a view, inserting into it populates Usuario.
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'F4F24CA5-F20E-487D-8040-08AD578AC895')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('F4F24CA5-F20E-487D-8040-08AD578AC895', 'Legacy0', 'User0', 'legacy0@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '536D8D31-F1CE-42ED-8ED2-C0223BE3F1B9', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = '55021A22-E4DC-4BE0-86BB-6FFE8B6A5678')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('55021A22-E4DC-4BE0-86BB-6FFE8B6A5678', 'Legacy1', 'User1', 'legacy1@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '536D8D31-F1CE-42ED-8ED2-C0223BE3F1B9', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'B6741D12-91F5-4E2D-9615-F5AC02E249E5')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('B6741D12-91F5-4E2D-9615-F5AC02E249E5', 'Legacy2', 'User2', 'legacy2@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '536D8D31-F1CE-42ED-8ED2-C0223BE3F1B9', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'E74139F6-F419-472E-B0BA-3BCA15802D01')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('E74139F6-F419-472E-B0BA-3BCA15802D01', 'Legacy3', 'User3', 'legacy3@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '536D8D31-F1CE-42ED-8ED2-C0223BE3F1B9', GETUTCDATE(), GETUTCDATE(), 0);
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE IdUsuario = 'F408ED50-3FEB-4A70-B375-29B6624E9C01')
INSERT INTO Usuario (IdUsuario, Nombre, Apellido, Email, ContrasenaHash, Telefono, Cedula, Rol, Activo, EmailVerificado, PlanSuscripcionId, CreatedAtUtc, UpdatedAtUtc, ConsultasUsadas) VALUES ('F408ED50-3FEB-4A70-B375-29B6624E9C01', 'Legacy4', 'User4', 'legacy4@example.com', 'HASH', '809-000-0000', '000-0000000-0', 2, 1, 1, '536D8D31-F1CE-42ED-8ED2-C0223BE3F1B9', GETUTCDATE(), GETUTCDATE(), 0);
