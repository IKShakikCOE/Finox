using Finox.Shared.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Finox.Shared.Infrastructure.Errors;

/// <summary>
/// Replaces ASP.NET's default <c>ProblemDetails</c> model-validation response with the
/// API's standard <see cref="ErrorResponse"/> shape, keeping one error vocabulary across
/// the whole API. (Requirements 6.1, 6.2.)
/// </summary>
public static class ValidationErrorFactory
{
    public static IActionResult Produce(ActionContext context)
    {
        var details = context.ModelState
            .Where(kvp => kvp.Value is not null && kvp.Value.Errors.Count > 0)
            .ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value!.Errors
                    .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage) ? "Invalid value." : e.ErrorMessage)
                    .ToArray());

        var body = new ErrorResponse(
            ErrorCodes.Validation,
            "One or more validation errors occurred.",
            details.Count > 0 ? details : null);

        return new BadRequestObjectResult(body)
        {
            ContentTypes = { "application/json" }
        };
    }
}
