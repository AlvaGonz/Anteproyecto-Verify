namespace Domain.ValueObjects;

using System;
using System.Collections.Generic;
using Domain.Common;

public class Coordenadas : ValueObject
{
    public double Latitud { get; private set; }
    public double Longitud { get; private set; }

    private Coordenadas() { }

    public Coordenadas(double latitud, double longitud)
    {
        if (latitud < -90 || latitud > 90)
            throw new ArgumentException("Latitud debe estar entre -90 y 90.", nameof(latitud));
        if (longitud < -180 || longitud > 180)
            throw new ArgumentException("Longitud debe estar entre -180 y 180.", nameof(longitud));

        Latitud = latitud;
        Longitud = longitud;
    }

    public static Coordenadas? Parse(string? gpsString)
    {
        if (string.IsNullOrWhiteSpace(gpsString)) return null;

        var parts = gpsString.Split(',');
        if (parts.Length != 2) return null;

        if (double.TryParse(parts[0].Trim(), out double lat) && double.TryParse(parts[1].Trim(), out double lon))
        {
            try
            {
                return new Coordenadas(lat, lon);
            }
            catch
            {
                return null;
            }
        }

        return null;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Latitud;
        yield return Longitud;
    }

    public override string ToString()
    {
        return $"{Latitud}, {Longitud}";
    }
}
