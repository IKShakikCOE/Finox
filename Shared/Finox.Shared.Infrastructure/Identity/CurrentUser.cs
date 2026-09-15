using System.Security.Claims;
using Finox.Shared.Domain;
using Microsoft.AspNetCore.Http;

namespace Finox.Shared.Infrastructure.Identity;

/// <summary>
/// Resolves <see cref="ICurrentUser"/> from the request's <see cref="ClaimsPrincipal"/>.
/// Reads the standard OIDC claim names emitted by Keycloak. (Requirement 1.6.)
/// </summary>
public sealed class CurrentUser : ICurrentUser
{
    private readonly ClaimsPrincipal? _principal;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _principal = httpContextAccessor.HttpContext?.User;
    }

    public bool IsAuthenticated => _principal?.Identity?.IsAuthenticated ?? false;

    public Guid Id => Guid.Parse(
        Find(ClaimTypes.NameIdentifier, "sub")
        ?? throw new InvalidOperationException("No authenticated user is available for the current request."));

    public string Username =>
        Find("preferred_username", ClaimTypes.Name) ?? Id.ToString();

    public string? Email => Find(ClaimTypes.Email, "email");

    public string? FullName => Find("name", ClaimTypes.Name);

    private string? Find(params string[] claimTypes)
    {
        if (_principal is null)
        {
            return null;
        }

        foreach (var type in claimTypes)
        {
            var value = _principal.FindFirstValue(type);
            if (!string.IsNullOrEmpty(value))
            {
                return value;
            }
        }

        return null;
    }
}
