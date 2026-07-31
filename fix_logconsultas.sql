USE [verifinca-spm-uce-2026];
DROP TABLE IF EXISTS [LogConsultas];
CREATE TABLE [LogConsultas] (
    [Id] uniqueidentifier NOT NULL,
    [UsuarioId] uniqueidentifier NOT NULL,
    [FechaConsulta] datetime2 NOT NULL,
    [Exitoso] bit NOT NULL,
    [Detalle] nvarchar(500) NULL,
    [CreatedAtUtc] datetime2 NOT NULL,
    [UpdatedAtUtc] datetime2 NULL,
    CONSTRAINT [PK_LogConsultas] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_LogConsultas_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([IdUsuario]) ON DELETE NO ACTION
);
CREATE INDEX [IX_LogConsultas_FechaConsulta] ON [LogConsultas] ([FechaConsulta]);
CREATE INDEX [IX_LogConsultas_UsuarioId] ON [LogConsultas] ([UsuarioId]);
