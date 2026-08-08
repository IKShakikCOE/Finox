namespace Finox.Shared.Domain;

/// <summary>
/// The authenticated user for the current request, resolved from the validated
/// Keycloak access-token claims. Registered as scoped in the API; consumed by the
/// persistence layer to scope per-user data. (Requirement 1.6.)
/// </summary>
public interface ICurrentUser
{
    /// <summary>Keycloak <c>sub</c> claim — the stable user identifier used to scope per-user data.</summary>
    string Id { get; }

    /// <summary>Keycloak <c>preferred_username</c> claim.</summary>
    string Username { get; }

    /// <summary>Keycloak <c>email</c> claim, if present.</summary>
    string? Email { get; }

    /// <summary>Keycloak <c>name</c> claim, if present.</summary>
    string? FullName { get; }

    /// <summary>Whether the current request carries an authenticated principal.</summary>
    bool IsAuthenticated { get; }
}
