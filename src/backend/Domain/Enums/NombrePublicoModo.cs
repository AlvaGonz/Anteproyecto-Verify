using System;

namespace Domain.Enums;

/// <summary>
/// Combinación de formas de nombre a mostrar públicamente. El usuario puede
/// elegir UNA o AMBAS (nunca ninguna).
/// </summary>
[Flags]
public enum NombrePublicoModo
{
    RealName = 1,
    Nickname = 2
}
