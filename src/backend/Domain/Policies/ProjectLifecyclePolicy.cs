namespace Domain.Policies;

using Domain.Enums;

/// <summary>
/// Rules for automatic project lifecycle transitions driven by expediente activity.
/// </summary>
public static class ProjectLifecyclePolicy
{
    /// <summary>
    /// Projects with at least one uploaded document should enter review
    /// when they are still in an early drafting status (CREADO / EDITADO).
    /// </summary>
    public static bool ShouldEnterReview(string? currentCodigoUnico, int documentCount)
    {
        if (documentCount < 1) return false;

        return string.IsNullOrEmpty(currentCodigoUnico)
            || currentCodigoUnico == ProjectStatusCodes.Creado
            || currentCodigoUnico == ProjectStatusCodes.Editado;
    }
}
