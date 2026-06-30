namespace Application.Common;

/// <summary>
/// Shared constants for the Law 172-13 consent gate (COMP-001).
/// Centralizes version management so all handlers reference the same value.
/// </summary>
public static class ConsentGateConstants
{
    /// <summary>
    /// Current privacy policy version.
    /// Increment when terms change — all users MUST re-consent before credit data is queried.
    /// </summary>
    public const string CurrentVersionPolitica = "v1.0";
}
