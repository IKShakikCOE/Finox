using System.Text.Json;
using Finox.Shared.Infrastructure.Errors;
using Finox.Shared.Domain;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Finox.Shared.Infrastructure.Auth;

/// <summary>
/// Configures Keycloak JWT Bearer authentication and a global "require authenticated user"
/// fallback policy. Token validation checks the realm issuer, signing key, and lifetime
/// (Requirements 1.1, 1.2, 1.5); auth failures emit the standard 401 Error_Body
/// (Requirements 1.3, 1.4, 1.5, 6.5).
/// </summary>
public static class AuthenticationSetup
{
    private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

    public static IServiceCollection AddFinoxAuthentication(
        this IServiceCollection services,
        string authority,
        bool requireHttpsMetadata = true,
        string? audience = null)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = authority;
                options.RequireHttpsMetadata = requireHttpsMetadata;
                options.MetadataAddress = $"{authority}/.well-known/openid-configuration";

                var validAudiences = new List<string> { "account", "finox-app" };
                if (!string.IsNullOrWhiteSpace(audience))
                {
                    validAudiences.Add(audience);
                }

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = authority,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    ValidateAudience = false,
                    NameClaimType = "preferred_username",
                    RoleClaimType = "roles"
                };

                // Emit the standard Error_Body on auth challenge/failure instead of an empty 401.
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"[JwtBearer Auth Failed]: {context.Exception.Message}");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        if (context.Principal?.Identity is System.Security.Claims.ClaimsIdentity identity)
                        {
                            var realmAccessClaim = identity.FindFirst("realm_access");
                            if (realmAccessClaim != null)
                            {
                                try
                                {
                                    using var doc = JsonDocument.Parse(realmAccessClaim.Value);
                                    if (doc.RootElement.TryGetProperty("roles", out var rolesElement) &&
                                        rolesElement.ValueKind == JsonValueKind.Array)
                                    {
                                        foreach (var role in rolesElement.EnumerateArray())
                                        {
                                            var roleName = role.GetString();
                                            if (!string.IsNullOrEmpty(roleName))
                                            {
                                                identity.AddClaim(new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Role, roleName));
                                                identity.AddClaim(new System.Security.Claims.Claim("roles", roleName));
                                            }
                                        }
                                    }
                                }
                                catch { }
                            }
                        }
                        return Task.CompletedTask;
                    },
                    OnChallenge = async challengeContext =>
                    {
                        // Suppress the default empty challenge and write our JSON body once.
                        challengeContext.HandleResponse();
                        await WriteUnauthorizedAsync(challengeContext.HttpContext,
                            "Authentication is required or the supplied token is invalid.");
                    },
                    OnForbidden = async forbiddenContext =>
                    {
                        await WriteForbiddenAsync(forbiddenContext.HttpContext);
                    }
                };
            });

        services.AddAuthorization(options =>
        {
            // Every endpoint requires an authenticated user unless it opts out with [AllowAnonymous].
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();
        });

        return services;
    }

    private static async Task WriteUnauthorizedAsync(HttpContext context, string message)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(
            new ErrorResponse(ErrorCodes.Unauthorized, message), JsonOpts);
    }

    private static async Task WriteForbiddenAsync(HttpContext context)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(
            new ErrorResponse("FORBIDDEN", "You do not have permission to perform this action."), JsonOpts);
    }
}
