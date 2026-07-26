namespace Application.Documents.Extractions;

using System.Collections.Generic;

/// <summary>
/// Static alias registry for the 32 DR provinces.
/// Maps normalized OCR variants to their canonical NombreProvincia value.
/// Source: ONE Divisi�n Territorial 2021 + known OCR noise patterns from real document samples.
/// </summary>
public static class ProvinciaAliasRegistry
{
    /// <summary>
    /// Key: normalized alias (uppercase, no accents, trimmed).
    /// Value: canonical name matching Provincia.NombreProvincia in DB.
    /// </summary>
    private static readonly Dictionary<string, string> _aliases = new(System.StringComparer.OrdinalIgnoreCase)
    {
// Distrito Nacional
        { "D.N.", "Distrito Nacional" },
        { "DN", "Distrito Nacional" },
        { "D.N", "Distrito Nacional" },
        { "DIST NACIONAL", "Distrito Nacional" },
        { "DISTRITO NACIONAL", "Distrito Nacional" },

        // La Altagracia (common OCR: "ALTAGRACIA", "LAALTAGRACIA", etc.)
        { "ALTAGRACIA", "La Altagracia" },
        { "LA ALTAGRACIA", "La Altagracia" },
        { "LAALTAGRACIA", "La Altagracia" },

        // Santiago
        { "SANTIAGO", "Santiago" },
        { "STGO", "Santiago" },
        { "STGO.", "Santiago" },

        // Santo Domingo
        { "SANTO DOMINGO", "Santo Domingo" },
        { "STO DOMINGO", "Santo Domingo" },
        { "STO. DOMINGO", "Santo Domingo" },

        // San Crist�bal
        { "SAN CRISTOBAL", "San Crist�bal" },
        { "CRISTOBAL", "San Crist�bal" },

        // San Pedro de Macor�s
        { "SAN PEDRO", "San Pedro de Macor�s" },
        { "SAN PEDRO DE MACORIS", "San Pedro de Macor�s" },
        { "SPM", "San Pedro de Macor�s" },

        // La Romana
        { "LA ROMANA", "La Romana" },
        { "LAROMANA", "La Romana" },

        // Puerto Plata
        { "PUERTO PLATA", "Puerto Plata" },
        { "PTO PLATA", "Puerto Plata" },
        { "PTO. PLATA", "Puerto Plata" },

        // La Vega
        { "LA VEGA", "La Vega" },
        { "LAVEGA", "La Vega" },

        // Peravia (sometimes OCR'd as BANI, which is the capital)
        { "BANI", "Peravia" },
        { "BANI PERAVIA", "Peravia" },

        // San Juan (de la Maguana)
        { "SAN JUAN", "San Juan" },
        { "SAN JUAN DE LA MAGUANA", "San Juan" },

        // Duarte
        { "DUARTE", "Duarte" },
        { "SAN FRANCISCO DE MACORIS", "Duarte" }, // capital used as alias

        // Espaillat
        { "ESPAILLAT", "Espaillat" },
        { "MOCA", "Espaillat" }, // capital used

        // Hermanas Mirabal
        { "HERMANAS MIRABAL", "Hermanas Mirabal" },
        { "SALCEDO", "Hermanas Mirabal" }, // old name

        // Mar�a Trinidad S�nchez
        { "MARIA TRINIDAD SANCHEZ", "Mar�a Trinidad S�nchez" },
        { "M.T. SANCHEZ", "Mar�a Trinidad S�nchez" },

        // Monse�or Nouel
        { "MONSENOR NOUEL", "Monse�or Nouel" },
        { "BONAO", "Monse�or Nouel" }, // capital used

        // Monte Cristi
        { "MONTE CRISTI", "Monte Cristi" },
        { "MONTECRISTI", "Monte Cristi" },

        // Monte Plata
        { "MONTE PLATA", "Monte Plata" },

        // S�nchez Ram�rez
        { "SANCHEZ RAMIREZ", "S�nchez Ram�rez" },
        { "COTUI", "S�nchez Ram�rez" }, // capital used

        // Santiago Rodr�guez
        { "SANTIAGO RODRIGUEZ", "Santiago Rodr�guez" },

        // San Jos� de Ocoa
        { "SAN JOSE DE OCOA", "San Jos� de Ocoa" },
        { "OCOA", "San Jos� de Ocoa" },

        // Valverde
        { "VALVERDE", "Valverde" },
        { "MAO", "Valverde" }, // capital used

        // Baoruco
        { "BAORUCO", "Baoruco" },
        { "NEIBA", "Baoruco" }, // capital used

        // Barahona
        { "BARAHONA", "Barahona" },

        // Dajab�n
        { "DAJABON", "Dajab�n" },

        // El Seibo
        { "EL SEIBO", "El Seibo" },
        { "ELSEIBO", "El Seibo" },
        { "SEIBO", "El Seibo" },

        // El�as Pi�a
        { "ELIAS PINA", "El�as Pi�a" },
        { "COMENDADOR", "El�as Pi�a" }, // capital used

        // Hato Mayor
        { "HATO MAYOR", "Hato Mayor" },
        { "HATOMAYOR", "Hato Mayor" },

        // Independencia
        { "INDEPENDENCIA", "Independencia" },

        // Pedernales
        { "PEDERNALES", "Pedernales" },

        // Saman�
        { "SAMANA", "Saman�" },
        { "SAMANA.", "Saman�" },
    };

    /// <summary>
    /// Resolves a normalized key to its canonical province name, or null if not found.
    /// Returns a list of matched alias keys for diagnostic purposes.
    /// </summary>
    public static (string? CanonicalName, List<string> MatchedAliases) Resolve(string normalizedKey)
    {
        if (_aliases.TryGetValue(normalizedKey, out var canonical))
            return (canonical, new List<string> { normalizedKey });

        return (null, new List<string>());
    }
}
