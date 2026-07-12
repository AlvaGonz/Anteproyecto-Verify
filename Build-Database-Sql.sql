SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================
-- SEED DATA ONLY — Schema is managed exclusively by EF Core Migrations
-- ============================================================
-- This file is now DEPRECATED.
-- All seed data (Provincias, PlanesSuscripcion, etc.) is now handled by
-- AppDbContextSeeder.SeedAsync() in Infrastructure/Persistence/AppDbContextSeeder.cs
-- which runs on every API startup and is fully idempotent.
-- ============================================================

PRINT 'Build-Database-Sql.sql is deprecated. Seed data is now managed by EF Core seeder.';
GO