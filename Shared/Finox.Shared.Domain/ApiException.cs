using System.Net;

namespace Finox.Shared.Domain;

/// <summary>Stable machine-readable error codes surfaced in API error responses.</summary>
public static class ErrorCodes
{
    public const string Validation = "VALIDATION_ERROR";
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string NotFound = "NOT_FOUND";
    public const string Conflict = "CONFLICT";
    public const string Internal = "INTERNAL_ERROR";
}

/// <summary>
/// Base type for exceptions that map to a defined HTTP status and error body. May be thrown
/// from any layer; the API's exception middleware serializes it to the standard error shape.
/// </summary>
public abstract class ApiException : Exception
{
    protected ApiException(string message) : base(message) { }

    /// <summary>HTTP status code this exception maps to.</summary>
    public abstract HttpStatusCode StatusCode { get; }

    /// <summary>Machine-readable error code placed in the response body.</summary>
    public abstract string ErrorCode { get; }

    /// <summary>Optional field-level detail (used for validation failures).</summary>
    public virtual IReadOnlyDictionary<string, string[]>? Details => null;
}

/// <summary>Maps to HTTP 400. Used for missing/invalid fields and missing required query params.</summary>
public sealed class ValidationException : ApiException
{
    public ValidationException(string message, IReadOnlyDictionary<string, string[]>? details = null)
        : base(message)
    {
        Details = details;
    }

    public override HttpStatusCode StatusCode => HttpStatusCode.BadRequest;
    public override string ErrorCode => ErrorCodes.Validation;
    public override IReadOnlyDictionary<string, string[]>? Details { get; }

    /// <summary>Convenience for a single-field validation failure.</summary>
    public static ValidationException ForField(string field, string message) =>
        new(message, new Dictionary<string, string[]> { [field] = new[] { message } });
}

/// <summary>Maps to HTTP 401.</summary>
public sealed class UnauthorizedException : ApiException
{
    public UnauthorizedException(string message = "Authentication is required.") : base(message) { }

    public override HttpStatusCode StatusCode => HttpStatusCode.Unauthorized;
    public override string ErrorCode => ErrorCodes.Unauthorized;
}

/// <summary>
/// Maps to HTTP 404. Also used for foreign-owned rows so existence is not leaked
/// (Requirements 3.3, 6.3).
/// </summary>
public sealed class NotFoundException : ApiException
{
    public NotFoundException(string message = "The requested resource was not found.") : base(message) { }

    public override HttpStatusCode StatusCode => HttpStatusCode.NotFound;
    public override string ErrorCode => ErrorCodes.NotFound;
}

/// <summary>Maps to HTTP 409. Used for duplicate resources (e.g. an existing Keycloak user).</summary>
public sealed class ConflictException : ApiException
{
    public ConflictException(string message = "The resource already exists.") : base(message) { }

    public override HttpStatusCode StatusCode => HttpStatusCode.Conflict;
    public override string ErrorCode => ErrorCodes.Conflict;
}
