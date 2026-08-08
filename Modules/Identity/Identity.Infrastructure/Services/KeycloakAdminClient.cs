using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Finox.Shared.Domain;
using Identity.Domain;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Identity.Infrastructure.Services;

public sealed class KeycloakAdminClient : IKeycloakAdminClient
{
    private readonly HttpClient _http;
    private readonly KeycloakOptions _options;
    private readonly ILogger<KeycloakAdminClient> _logger;

    private string? _adminToken;
    private DateTimeOffset _adminTokenExpiresAt = DateTimeOffset.MinValue;
    private readonly SemaphoreSlim _tokenLock = new(1, 1);

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public KeycloakAdminClient(HttpClient http, IOptions<KeycloakOptions> options, ILogger<KeycloakAdminClient> logger)
    {
        _http = http;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> CreateUserAsync(RegisterRequest request, CancellationToken ct)
    {
        await AuthorizeAsync(ct);

        var payload = new
        {
            username = request.Username,
            email = request.Email,
            firstName = request.FirstName,
            lastName = request.LastName,
            enabled = true,
            emailVerified = false,
            credentials = new[]
            {
                new { type = "password", value = request.Password, temporary = false }
            }
        };

        using var message = new HttpRequestMessage(HttpMethod.Post, $"{_options.AdminRealmUrl}/users")
        {
            Content = JsonContent.Create(payload, options: Json)
        };
        message.Headers.Authorization = new("Bearer", _adminToken);

        using var response = await _http.SendAsync(message, ct);

        if (response.StatusCode == HttpStatusCode.Conflict)
        {
            throw new ConflictException($"A user with username '{request.Username}' or email '{request.Email}' already exists.");
        }

        response.EnsureSuccessStatusCode();

        var location = response.Headers.Location?.ToString();
        var id = location?[(location.LastIndexOf('/') + 1)..];
        return id ?? await FindUserIdByEmailAsync(request.Email, ct) ?? string.Empty;
    }

    public async Task SendPasswordResetEmailAsync(string email, CancellationToken ct)
    {
        await AuthorizeAsync(ct);

        var userId = await FindUserIdByEmailAsync(email, ct)
            ?? throw new NotFoundException($"No user with email '{email}' was found.");

        using var message = new HttpRequestMessage(
            HttpMethod.Put,
            $"{_options.AdminRealmUrl}/users/{userId}/execute-actions-email")
        {
            Content = JsonContent.Create(new[] { "UPDATE_PASSWORD" }, options: Json)
        };
        message.Headers.Authorization = new("Bearer", _adminToken);

        using var response = await _http.SendAsync(message, ct);
        response.EnsureSuccessStatusCode();
    }

    public async Task<bool> VerifyPasswordAsync(string username, string currentPassword, CancellationToken ct)
    {
        var form = new Dictionary<string, string>
        {
            ["grant_type"] = "password",
            ["client_id"] = _options.ClientId,
            ["username"] = username,
            ["password"] = currentPassword
        };

        using var response = await _http.PostAsync(
            _options.TokenEndpoint, new FormUrlEncodedContent(form), ct);

        return response.IsSuccessStatusCode;
    }

    public async Task SetPasswordAsync(string userId, string newPassword, CancellationToken ct)
    {
        await AuthorizeAsync(ct);

        var payload = new { type = "password", value = newPassword, temporary = false };

        using var message = new HttpRequestMessage(
            HttpMethod.Put,
            $"{_options.AdminRealmUrl}/users/{userId}/reset-password")
        {
            Content = JsonContent.Create(payload, options: Json)
        };
        message.Headers.Authorization = new("Bearer", _adminToken);

        using var response = await _http.SendAsync(message, ct);
        response.EnsureSuccessStatusCode();
    }

    public async Task<string?> FindUserIdByEmailAsync(string email, CancellationToken ct)
    {
        await AuthorizeAsync(ct);

        using var message = new HttpRequestMessage(
            HttpMethod.Get,
            $"{_options.AdminRealmUrl}/users?email={Uri.EscapeDataString(email)}&exact=true");
        message.Headers.Authorization = new("Bearer", _adminToken);

        using var response = await _http.SendAsync(message, ct);
        response.EnsureSuccessStatusCode();

        var users = await response.Content.ReadFromJsonAsync<List<KeycloakUser>>(Json, ct);
        return users?.FirstOrDefault()?.Id;
    }

    private async Task AuthorizeAsync(CancellationToken ct)
    {
        if (_adminToken is not null && DateTimeOffset.UtcNow < _adminTokenExpiresAt)
        {
            return;
        }

        await _tokenLock.WaitAsync(ct);
        try
        {
            if (_adminToken is not null && DateTimeOffset.UtcNow < _adminTokenExpiresAt)
            {
                return;
            }

            var form = new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = _options.AdminClientId,
                ["client_secret"] = _options.AdminClientSecret
            };

            using var response = await _http.PostAsync(
                _options.TokenEndpoint, new FormUrlEncodedContent(form), ct);
            response.EnsureSuccessStatusCode();

            var token = await response.Content.ReadFromJsonAsync<TokenResponse>(Json, ct)
                ?? throw new InvalidOperationException("Keycloak returned an empty token response.");

            _adminToken = token.AccessToken;
            _adminTokenExpiresAt = DateTimeOffset.UtcNow.AddSeconds(Math.Max(30, token.ExpiresIn) - 30);
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    private sealed class TokenResponse
    {
        [JsonPropertyName("access_token")] public string AccessToken { get; set; } = string.Empty;
        [JsonPropertyName("expires_in")] public int ExpiresIn { get; set; }
    }

    private sealed class KeycloakUser
    {
        [JsonPropertyName("id")] public string Id { get; set; } = string.Empty;
        [JsonPropertyName("email")] public string? Email { get; set; }
    }
}
