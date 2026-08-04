using System;

namespace Domain.Enums;

/// <summary>
/// Combinación de documentos de identidad a mostrar públicamente. El usuario
/// puede elegir UNO o AMBOS (nunca ninguno).
/// </summary>
[Flags]
public enum IdentificacionPublicaModo
{
    Cedula = 1,
    Rnc = 2
}
