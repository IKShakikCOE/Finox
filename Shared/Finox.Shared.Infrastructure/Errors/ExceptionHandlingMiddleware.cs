using System.Text.Json;
using Finox.Shared.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Finox.Shared.Infrastructure.Errors;

/// <summary>
/// Outermost middleware: catches every downstream exception and serializes it to the
/// standard <see cref="ErrorResponse"/> shape with <c>Content-Type: application/json</c>.
/// Known <see cref="ApiException"/>s map to their declared status; anything else is a
/// 500 that is logged in full server-side but returns a generic body with no internals.
/// (Requirements 6.1, 6.4, 6.5.)
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ApiException ex)
        {
            _logger.LogInformation(ex, "Handled API exception {ErrorCode}: {Message}", ex.ErrorCode, ex.Message);
            await WriteAsync(context, (int)ex.StatusCode,
                new ErrorResponse(ex.ErrorCode, ex.Message, ex.Details));
        }
        catch (Exception ex)
        {
            // Unhandled: log the full exception, but never leak internals to the client.
            _logger.LogError(ex, "Unhandled exception processing {Method} {Path}",
                context.Request.Method, context.Request.Path);
            await WriteAsync(context, StatusCodes.Status500InternalServerError,
                new ErrorResponse(ErrorCodes.Internal, "An unexpected error occurred."));
        }
    }

    private static async Task WriteAsync(HttpContext context, int statusCode, ErrorResponse body)
    {
        if (context.Response.HasStarted)
        {
            // Cannot rewrite a response that has already begun streaming.
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(body, SerializerOptions);
    }

    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
}
