using System.ComponentModel.DataAnnotations;
using Finox.Shared.Domain;
using Identity.Domain;
using Identity.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Controllers;

public sealed class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public sealed class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}

public sealed class RegisterApiRequest
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public RegisterRequest ToDomain() => new()
    {
        Username = Username,
        Email = Email,
        Password = Password,
        FirstName = FirstName,
        LastName = LastName
    };
}

/// <summary>
/// Server-side wrappers around privileged Keycloak operations plus current-user projection.
/// Register and forgot-password are anonymous; change-password and me require a valid token.
/// (Requirement 2.)
/// </summary>
[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IKeycloakAdminClient _keycloak;
    private readonly ICurrentUser _currentUser;

    public AuthController(IKeycloakAdminClient keycloak, ICurrentUser currentUser)
    {
        _keycloak = keycloak;
        _currentUser = currentUser;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterApiRequest request, CancellationToken ct)
    {
        await _keycloak.CreateUserAsync(request.ToDomain(), ct);
        return StatusCode(StatusCodes.Status201Created);
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        await _keycloak.SendPasswordResetEmailAsync(request.Email, ct);
        return Ok();
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        var valid = await _keycloak.VerifyPasswordAsync(_currentUser.Username, request.CurrentPassword, ct);
        if (!valid)
        {
            throw new Finox.Shared.Domain.ValidationException("The current password is incorrect.");
        }

        await _keycloak.SetPasswordAsync(_currentUser.Id.ToString(), request.NewPassword, ct);
        return Ok();
    }

    [HttpGet("me")]
    public ActionResult<AuthUser> Me()
    {
        var fullName = _currentUser.FullName ?? _currentUser.Username;
        return Ok(new AuthUser
        {
            Id = _currentUser.Id,
            Username = _currentUser.Username,
            Email = _currentUser.Email ?? string.Empty,
            FullName = fullName
        });
    }
}

/// <summary>User profile (partial update) and settings (Requirement 22).</summary>
[ApiController]
[Route("api/user")]
public sealed class UserController : ControllerBase
{
    private readonly IdentityDbContext _db;
    private readonly ICurrentUser _user;
    private readonly IIdGenerator _idGen;

    public UserController(IdentityDbContext db, ICurrentUser user, IIdGenerator idGen)
    {
        _db = db;
        _user = user;
        _idGen = idGen;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfile>> GetProfile(CancellationToken ct)
    {
        var profile = await _db.Set<UserProfile>().FirstOrDefaultAsync(ct);
        if (profile is null)
        {
            profile = new UserProfile { Id = _idGen.NewId(), OwnerId = _user.Id, Email = _user.Email, FullName = _user.FullName };
            _db.Set<UserProfile>().Add(profile);
            await _db.SaveChangesAsync(ct);
        }
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<ActionResult<UserProfile>> UpdateProfile([FromBody] UserProfile input, CancellationToken ct)
    {
        var existing = await _db.Set<UserProfile>().FirstOrDefaultAsync(ct);
        if (existing is null)
        {
            input.Id = _idGen.NewId();
            input.OwnerId = _user.Id;
            _db.Set<UserProfile>().Add(input);
            await _db.SaveChangesAsync(ct);
            return Ok(input);
        }

        if (input.FullName is not null) existing.FullName = input.FullName;
        if (input.Email is not null) existing.Email = input.Email;
        if (input.Phone is not null) existing.Phone = input.Phone;
        if (input.Avatar is not null) existing.Avatar = input.Avatar;
        if (input.Designation is not null) existing.Designation = input.Designation;
        if (input.Company is not null) existing.Company = input.Company;
        if (input.Address is not null) existing.Address = input.Address;
        if (input.City is not null) existing.City = input.City;
        if (input.Country is not null) existing.Country = input.Country;
        if (input.Currency is not null) existing.Currency = input.Currency;
        if (input.Language is not null) existing.Language = input.Language;
        if (input.Timezone is not null) existing.Timezone = input.Timezone;

        await _db.SaveChangesAsync(ct);
        return Ok(existing);
    }

    [HttpGet("settings")]
    public async Task<ActionResult<UserSettings>> GetSettings(CancellationToken ct)
    {
        var settings = await _db.Set<UserSettings>().FirstOrDefaultAsync(ct);
        if (settings is null)
        {
            settings = new UserSettings { Id = _idGen.NewId(), OwnerId = _user.Id };
            _db.Set<UserSettings>().Add(settings);
            await _db.SaveChangesAsync(ct);
        }
        return Ok(settings);
    }

    [HttpPut("settings")]
    public async Task<ActionResult<UserSettings>> UpdateSettings([FromBody] UserSettings input, CancellationToken ct)
    {
        var existing = await _db.Set<UserSettings>().FirstOrDefaultAsync(ct);
        if (existing is null)
        {
            input.Id = _idGen.NewId();
            input.OwnerId = _user.Id;
            _db.Set<UserSettings>().Add(input);
            await _db.SaveChangesAsync(ct);
            return Ok(input);
        }

        existing.Notifications = input.Notifications;
        existing.Privacy = input.Privacy;
        existing.Display = input.Display;
        await _db.SaveChangesAsync(ct);
        return Ok(existing);
    }
}

