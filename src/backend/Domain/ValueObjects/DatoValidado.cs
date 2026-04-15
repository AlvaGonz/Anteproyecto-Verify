namespace Domain.ValueObjects;

using System;
using System.Collections.Generic;
using Domain.Common;

public class DatoValidado : ValueObject
{
    public string Campo { get; private set; } = null!;
    public string ValorEsperado { get; private set; } = null!;
    public string ValorEncontrado { get; private set; } = null!;
    public bool Coincide { get; private set; }
    public string? MetodoComparacion { get; private set; }

    private DatoValidado() { }

    public DatoValidado(string campo, string valorEsperado, string valorEncontrado, bool coincide, string? metodoComparacion = "Exacto")
    {
        if (string.IsNullOrWhiteSpace(campo)) throw new ArgumentException("Campo requerido", nameof(campo));
        
        Campo = campo;
        ValorEsperado = valorEsperado;
        ValorEncontrado = valorEncontrado;
        Coincide = coincide;
        MetodoComparacion = metodoComparacion;
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Campo;
        yield return ValorEsperado;
        yield return ValorEncontrado;
        yield return Coincide;
        if (MetodoComparacion != null) yield return MetodoComparacion;
    }
}
