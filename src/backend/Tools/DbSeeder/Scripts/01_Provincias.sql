-- ============================================================

-- Provincia — Static reference data (32 provinces of Dominican Republic)

-- ============================================================

-- Idempotent: uses MERGE to insert only missing rows.

-- ============================================================



USE [verifinca-spm-uce-2026];

GO



-- Create a temp table with the seed data

CREATE TABLE #ProvinciaSeed (

    NombreProvincia VARCHAR(100) NOT NULL,

    Latitud         DECIMAL(18,10) NULL,

    Longitud        DECIMAL(18,10) NULL

);



INSERT INTO #ProvinciaSeed (NombreProvincia, Latitud, Longitud) VALUES

    ('Distrito Nacional', 18.47186, -69.93988),

    ('Azua',              18.45320, -70.73490),

    ('Bahoruco',           18.50000, -71.30000),

    ('Barahona',          18.20850, -71.10080),

    ('Dajabón',           19.54000, -71.70000),

    ('Duarte',            19.30000, -70.25000),

    ('El Seibo',          18.76000, -69.04000),

    ('Elías Piña',        18.88000, -71.68000),

    ('Espaillat',         19.50000, -70.50000),

    ('Hato Mayor',        18.76000, -69.25000),

    ('Hermanas Mirabal',  19.38000, -70.35000),

    ('Independencia',     18.40000, -71.60000),

    ('La Altagracia',     18.61890, -68.70830),

    ('La Romana',         18.42730, -68.97280),

    ('La Vega',           19.22000, -70.53000),

    ('María Trinidad Sánchez', 19.38000, -69.95000),

    ('Monseñor Nouel',    18.91000, -70.43000),

    ('Monte Cristi',      19.72000, -71.58000),

    ('Monte Plata',       18.80700, -69.78900),

    ('Pedernales',        18.03000, -71.74000),

    ('Peravia',           18.28000, -70.33000),

    ('Puerto Plata',      19.79340, -70.68840),

    ('Samaná',            19.20000, -69.33000),

    ('San Cristóbal',     18.41667, -70.10000),

    ('San José de Ocoa',  18.55000, -70.50000),

    ('San Juan',          18.80580, -71.22990),

    ('San Pedro de Macorís', 18.45390, -69.30820),

    ('Sánchez Ramírez',   19.00160, -70.14920),

    ('Santiago',          19.45170, -70.69703),

    ('Santiago Rodríguez',19.48000, -71.34000),

    ('Santo Domingo',     18.54118, -69.83988),

    ('Valverde',          19.58000, -71.07000);



-- MERGE: Insert only provinces that don't exist yet

MERGE INTO Provincia AS target

USING #ProvinciaSeed AS source

    ON target.NombreProvincia = source.NombreProvincia

WHEN NOT MATCHED BY TARGET THEN

    INSERT (NombreProvincia, Latitud, Longitud)

    VALUES (source.NombreProvincia, source.Latitud, source.Longitud);



DROP TABLE #ProvinciaSeed;

GO



PRINT 'Provincia seed data applied successfully.';

GO
