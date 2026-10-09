namespace Finox.Shared.Infrastructure.Errors;

/// <summary>
/// The standard error body returned by every error response across the API:
/// <c>{ "error": string, "message": string, "details": object }</c>.
/// (Requirements 6.1, 6.2.)
/// </summary>
public sealed class ErrorResponse
{
    /// <summary>Stable machine-readable code, e.g. <c>NOT_FOUND</c>, <c>VALIDATION_ERROR</c>.</summary>
    public string Error { get; set; } = string.Empty;

    /// <summary>Human-readable message, safe to display to a client.</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>Optional structured detail, e.g. field-level validation messages.</summary>
    public IReadOnlyDictionary<string, string[]>? Details { get; set; }

    public ErrorResponse() { }

    public ErrorResponse(string error, string message, IReadOnlyDictionary<string, string[]>? details = null)
    {
        Error = error;
        Message = message;
        Details = details;
    }
}
