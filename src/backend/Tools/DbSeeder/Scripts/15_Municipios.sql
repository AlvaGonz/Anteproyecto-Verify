-- ============================================================
-- Municipio — Static reference data (158 municipalities of Dominican Republic)
-- Source: OCHA COD-AB (HDX) - https://data.humdata.org/dataset/cod-ab-dom
-- Coordinates extracted from do.json (2026-06-27)
-- ============================================================
-- Idempotent: uses MERGE to insert only missing rows.
-- Requires Provincia table to be populated first (FK constraint).
-- File: 15_Municipios.sql (sequence number 15 to run after 01_Provincias.sql)
-- ============================================================

USE [verifinca-spm-uce-2026];
GO

-- Create a temp table with the seed data
CREATE TABLE #MunicipioSeed (
    NombreMunicipio   VARCHAR(100) NOT NULL,
    NombreProvincia   VARCHAR(100) NOT NULL,
    Latitud           DECIMAL(9,6) NULL,
    Longitud          DECIMAL(9,6) NULL
);

-- Distrito Nacional (1 municipality)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Distrito Nacional', 'Distrito Nacional', 18.485, -69.93);

-- Santo Domingo (5 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Santo Domingo Este', 'Santo Domingo', 18.526, -69.802),
    ('Santo Domingo Oeste', 'Santo Domingo', 18.463, -69.992),
    ('Santo Domingo Norte', 'Santo Domingo', 18.612, -69.912),
    ('Boca Chica', 'Santo Domingo', 18.457, -69.615),
    ('San Antonio de Guerra', 'Santo Domingo', 18.581, -69.654);

-- Santiago (9 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Santiago de los Caballeros', 'Santiago', 19.517, -70.697),
    ('Tamboril', 'Santiago', 19.488, -70.608),
    ('Villa Gonzalez', 'Santiago', 19.45, -70.7),
    ('Licey al Medio', 'Santiago', 19.428, -70.619),
    ('Bisono', 'Santiago', 19.45, -70.7),
    ('Jánico', 'Santiago', 19.249, -70.764),
    ('López', 'Santiago', 19.428, -70.619),
    ('Puñal', 'Santiago', 19.398, -70.637),
    ('Sabana Iglesia', 'Santiago', 19.342, -70.745);

-- La Altagracia (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Higüey', 'La Altagracia', 18.708, -68.687),
    ('La Otra Banda', 'La Altagracia', 18.65, -68.75),
    ('San Rafael del Yuma', 'La Altagracia', 18.373, -68.727);

-- San Pedro de Macorís (5 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('San Pedro de Macorís', 'San Pedro de Macoris', 18.482, -69.26),
    ('Consuelo', 'San Pedro de Macoris', 18.594, -69.253),
    ('Ramon Santana', 'San Pedro de Macoris', 18.45, -69.3),
    ('Quisqueya', 'San Pedro de Macoris', 18.546, -69.423),
    ('Guayacanes', 'San Pedro de Macoris', 18.447, -69.433);

-- La Romana (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('La Romana', 'La Romana', 18.155, -68.677),
    ('Guaymate', 'La Romana', 18.567, -68.951),
    ('Villa Hermosa', 'La Romana', 18.451, -69.051);

-- Puerto Plata (9 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('San Felipe de Puerto Plata', 'Puerto Plata', 19.71, -70.692),
    ('Sosúa', 'Puerto Plata', 19.666, -70.491),
    ('Cabarete', 'Puerto Plata', 19.7833, -70.6833),
    ('Imbert', 'Puerto Plata', 19.765, -70.872),
    ('Altamira', 'Puerto Plata', 19.651, -70.793),
    ('Guananico', 'Puerto Plata', 19.697, -70.923),
    ('Los Hidalgos', 'Puerto Plata', 19.746, -71.015),
    ('Villa Isabela', 'Puerto Plata', 19.809, -71.136),
    ('Villa Montellano', 'Puerto Plata', 19.705, -70.577);

-- Duarte (7 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('San Francisco de Macorís', 'Duarte', 19.339, -70.206),
    ('Arenoso', 'Duarte', 19.189, -69.77),
    ('Castillo', 'Duarte', 19.24, -70.028),
    ('Eugenio María de Hostos', 'Duarte', 19.141, -70.021),
    ('Las Guáranas', 'Duarte', 19.2, -70.232),
    ('Pimentel', 'Duarte', 19.216, -70.147),
    ('Villa Riva', 'Duarte', 19.152, -69.903);

-- El Seibo (2 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('El Seibo', 'El Seibo', 18.741, -69.031),
    ('Miches', 'El Seibo', 18.962, -68.981);

-- Elías Piña (6 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Comendador', 'Elias Pina', 18.919, -71.696),
    ('Bánica', 'Elias Pina', 19.018, -71.645),
    ('El Llano', 'Elias Pina', 18.816, -71.672),
    ('Hondo Valle', 'Elias Pina', 18.711, -71.698),
    ('Juan Santiago', 'Elias Pina', 18.729, -71.602),
    ('Pedro Santana', 'Elias Pina', 19.173, -71.479);

-- Espaillat (4 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Moca', 'Espaillat', 19.478, -70.505),
    ('Gaspar Hernández', 'Espaillat', 19.614, -70.241),
    ('Cayetano Germosén', 'Espaillat', 19.344, -70.472),
    ('Jamao al Norte', 'Espaillat', 19.597, -70.467);

-- Hato Mayor (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Hato Mayor del Rey', 'Hato Mayor', 18.709, -69.326),
    ('Sabana de la Mar', 'Hato Mayor', 19.008, -69.412),
    ('El Valle', 'Hato Mayor', 18.944, -69.385);

-- Hermanas Mirabal (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Salcedo', 'Hermanas Mirabal', 19.447, -70.389),
    ('Tenares', 'Hermanas Mirabal', 19.448, -70.307),
    ('Villa Tapia', 'Hermanas Mirabal', 19.291, -70.39);

-- Independencia (6 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Jimaní', 'Independencia', 18.501, -71.844),
    ('Cristóbal', 'Independencia', 18.342, -71.299),
    ('Duvergé', 'Independencia', 18.32, -71.621),
    ('La Descubierta', 'Independencia', 18.598, -71.756),
    ('Postrer Río', 'Independencia', 18.599, -71.645);

-- Azua (10 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Azua de Compostela', 'Azua', 18.459, -70.754),
    ('Estebanía', 'Azua', 18.549, -70.658),
    ('Guayabal', 'Azua', 18.722, -70.768),
    ('Las Charcas', 'Azua', 18.385, -70.526),
    ('Las Yayas de Viajama', 'Azua', 18.594, -71.034),
    ('Padre Las Casas', 'Azua', 18.833, -70.895),
    ('Peralta', 'Azua', 18.591, -70.769),
    ('Pueblo Viejo', 'Azua', 18.401, -70.769),
    ('Sabana Yegua', 'Azua', 18.419, -70.88),
    ('Tábara Arriba', 'Azua', 18.484, -70.907);

-- Baoruco (5 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Neiba', 'Bahoruco', 18.419, -71.262),
    ('Galván', 'Bahoruco', 18.4833, -71.4167),
    ('Los Ríos', 'Bahoruco', 18.565, -71.582),
    ('Tamayo', 'Bahoruco', 18.477, -71.161),
    ('Villa Jaragua', 'Bahoruco', 18.544, -71.493);

-- Barahona (11 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Barahona', 'Barahona', 18.187, -71.139),
    ('Cabral', 'Barahona', 18.195, -71.248),
    ('El Peñón', 'Barahona', 18.294, -71.214),
    ('Enriquillo', 'Barahona', 17.979, -71.339),
    ('Fundación', 'Barahona', 18.262, -71.163),
    ('Jaquimeyes', 'Barahona', 18.304, -71.123),
    ('La Ciénaga', 'Barahona', 18.095, -71.142),
    ('Paraíso', 'Barahona', 18.035, -71.21),
    ('Polo', 'Barahona', 18.121, -71.323),
    ('Vicente Noble', 'Barahona', 18.41, -71.088),
    ('Las Salinas', 'Barahona', 18.237, -71.337);

-- Dajabón (5 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Dajabón', 'Dajabon', 19.571, -71.622),
    ('El Pino', 'Dajabon', 19.406, -71.489),
    ('Loma de Cabrera', 'Dajabon', 19.433, -71.618),
    ('Partido', 'Dajabon', 19.506, -71.513),
    ('Restauración', 'Dajabon', 19.304, -71.633);

-- Monte Cristi (6 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('San Fernando de Monte Cristi', 'Monte Cristi', 19.76, -71.652),
    ('Castañuelas', 'Monte Cristi', 19.737, -71.509),
    ('Guayubín', 'Monte Cristi', 19.688, -71.309),
    ('Las Matas de Santa Cruz', 'Monte Cristi', 19.626, -71.501),
    ('Pepillo Salcedo', 'Monte Cristi', 19.661, -71.655),
    ('Villa Vásquez', 'Monte Cristi', 19.809, -71.443);

-- Monte Plata (5 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Monte Plata', 'Monte Plata', 18.76, -69.839),
    ('Bayaguana', 'Monte Plata', 18.815, -69.592),
    ('Peralvillo', 'Monte Plata', 18.857, -70.066),
    ('Sabana Grande de Boyá', 'Monte Plata', 18.976, -69.775),
    ('Yamasá', 'Monte Plata', 18.768, -70.085);

-- Pedernales (4 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Pedernales', 'Pedernales', 18.064, -71.567),
    ('Oviedo', 'Pedernales', 17.827, -71.46),
    ('José Francisco Peña Gómez', 'Pedernales', 17.9, -71.5),
    ('Juancho', 'Pedernales', 17.9, -71.5);

-- Peravia (2 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Baní', 'Peravia', 18.351, -70.37),
    ('Nizao', 'Peravia', 18.269, -70.21);

-- San Cristóbal (8 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('San Cristóbal', 'San Cristobal', 18.415, -70.11),
    ('Bajos de Haina', 'San Cristobal', 18.432, -70.031),
    ('Cambita Garabitos', 'San Cristobal', 18.471, -70.223),
    ('Los Cacaos', 'San Cristobal', 18.61, -70.326),
    ('Sabana Grande de Palenque', 'San Cristobal', 18.258, -70.162),
    ('San Gregorio de Nigua', 'San Cristobal', 18.353, -70.086),
    ('Villa Altagracia', 'San Cristobal', 18.656, -70.226),
    ('Yaguate', 'San Cristobal', 18.34, -70.188);

-- San José de Ocoa (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('San José de Ocoa', 'San Jose de Ocoa', 18.557, -70.439),
    ('Sabana Larga', 'San Jose de Ocoa', 18.645, -70.559),
    ('Rancho Arriba', 'San Jose de Ocoa', 18.714, -70.438);

-- San Juan (6 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('San Juan de la Maguana', 'San Juan', 18.897, -71.326),
    ('Bohechío', 'San Juan', 18.909, -71.021),
    ('El Cercado', 'San Juan', 18.71, -71.512),
    ('Juan de Herrera', 'San Juan', 18.876, -71.201),
    ('Las Matas de Farfán', 'San Juan', 18.954, -71.493),
    ('Vallejuelo', 'San Juan', 18.667, -71.324);

-- Sánchez Ramírez (4 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Cotuí', 'Sanchez Ramirez', 18.998, -70.131),
    ('Fantino', 'Sanchez Ramirez', 19.103, -70.303),
    ('Cevicos', 'Sanchez Ramirez', 19.007, -69.976),
    ('La Mata', 'Sanchez Ramirez', 19.069, -70.234);

-- Santiago Rodríguez (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('San Ignacio de Sabaneta', 'Santiago Rodriguez', 19.369, -71.327),
    ('Monción', 'Santiago Rodriguez', 19.391, -71.185),
    ('Villa Los Almácigos', 'Santiago Rodriguez', 19.336, -71.439);

-- Valverde (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Mao', 'Valverde', 19.534, -71.042),
    ('Esperanza', 'Valverde', 19.628, -70.96),
    ('Laguna Salada', 'Valverde', 19.669, -71.101);

-- María Trinidad Sánchez (4 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Nagua', 'Maria Trinidad Sanchez', 19.35, -70.003),
    ('Cabrera', 'Maria Trinidad Sanchez', 19.58, -69.98),
    ('El Factor', 'Maria Trinidad Sanchez', 19.294, -69.931),
    ('Río San Juan', 'Maria Trinidad Sanchez', 19.567, -70.089);

-- Monseñor Nouel (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Bonao', 'Monsenor Nouel', 18.943, -70.441),
    ('Maimón', 'Monsenor Nouel', 18.888, -70.27),
    ('Piedra Blanca', 'Monsenor Nouel', 18.812, -70.331);

-- La Vega (4 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('La Vega', 'La Vega', 19.208, -70.458),
    ('Constanza', 'La Vega', 18.865, -70.691),
    ('Jarabacoa', 'La Vega', 19.106, -70.702),
    ('Jima Abajo', 'La Vega', 19.118, -70.374);

-- Samaná (3 municipalities)
INSERT INTO #MunicipioSeed (NombreMunicipio, NombreProvincia, Latitud, Longitud) VALUES
    ('Santa Bárbara de Samaná', 'Samana', 19.272, -69.32),
    ('Sánchez', 'Samana', 19.143, -69.678),
    ('Las Terrenas', 'Samana', 19.284, -69.566);

-- MERGE: Insert only municipalities that don't exist yet
MERGE INTO Municipio AS target
USING (
    SELECT 
        s.NombreMunicipio,
        p.IdProvincia,
        s.Latitud,
        s.Longitud
    FROM #MunicipioSeed s
    INNER JOIN Provincia p ON p.NombreProvincia = s.NombreProvincia
) AS source
    ON target.NombreMunicipio = source.NombreMunicipio 
    AND target.IdProvincia = source.IdProvincia
WHEN NOT MATCHED BY TARGET THEN
    INSERT (NombreMunicipio, IdProvincia, Latitud, Longitud)
    VALUES (source.NombreMunicipio, source.IdProvincia, source.Latitud, source.Longitud);

DROP TABLE #MunicipioSeed;
GO

PRINT 'Municipio seed data applied successfully (158 municipalities).';
GO