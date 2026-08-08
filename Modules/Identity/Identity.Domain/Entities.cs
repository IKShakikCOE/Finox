using Finox.Shared.Domain;

namespace Identity.Domain;

public sealed class UserProfile : IOwnedEntity
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;

    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Avatar { get; set; }
    public string? Designation { get; set; }
    public string? Company { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? JoinDate { get; set; }
    public string? Currency { get; set; }
    public string? Language { get; set; }
    public string? Timezone { get; set; }
}

/// <summary>
/// User settings stored as a single row with nested groups as JSON columns.
/// </summary>
public sealed class UserSettings : IOwnedEntity
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;

    public NotificationSettings Notifications { get; set; } = new();
    public PrivacySettings Privacy { get; set; } = new();
    public DisplaySettings Display { get; set; } = new();
}

public sealed class NotificationSettings
{
    public bool Email { get; set; } = true;
    public bool Push { get; set; } = true;
    public bool BudgetAlerts { get; set; } = true;
    public bool WeeklyReport { get; set; } = true;
}

public sealed class PrivacySettings
{
    public bool ShowProfile { get; set; } = true;
    public bool ShowActivity { get; set; } = true;
}

public sealed class DisplaySettings
{
    public string Currency { get; set; } = "BDT";
    public string DateFormat { get; set; } = "YYYY-MM-DD";
    public string Language { get; set; } = "en";
}

/// <summary>Registration payload for creating a Keycloak user (server-side admin wrapper).</summary>
public sealed class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

/// <summary>The current authenticated user projected from token claims (response for <c>/api/auth/me</c>).</summary>
public sealed class AuthUser
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string FullName { get; set; } = string.Empty;
}

public interface IKeycloakAdminClient
{
    Task<string> CreateUserAsync(RegisterRequest request, CancellationToken ct);
    Task SendPasswordResetEmailAsync(string email, CancellationToken ct);
    Task<bool> VerifyPasswordAsync(string username, string currentPassword, CancellationToken ct);
    Task SetPasswordAsync(string userId, string newPassword, CancellationToken ct);
    Task<string?> FindUserIdByEmailAsync(string email, CancellationToken ct);
}

public sealed class KeycloakOptions
{
    public const string SectionName = "Keycloak";

    public string BaseUrl { get; set; } = string.Empty;
    public string Realm { get; set; } = "finox";
    public string ClientId { get; set; } = "finox-app";
    public string? Audience { get; set; }
    public bool RequireHttpsMetadata { get; set; } = true;
    public string AdminClientId { get; set; } = string.Empty;
    public string AdminClientSecret { get; set; } = string.Empty;

    public string Authority => $"{BaseUrl.TrimEnd('/')}/realms/{Realm}";
    public string AdminRealmUrl => $"{BaseUrl.TrimEnd('/')}/admin/realms/{Realm}";
    public string TokenEndpoint => $"{Authority}/protocol/openid-connect/token";
}
