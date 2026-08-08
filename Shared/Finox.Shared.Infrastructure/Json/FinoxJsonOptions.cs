using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Finox.Shared.Infrastructure.Json;

/// <summary>
/// Centralizes the API's JSON conventions so the wire format matches what the Angular
/// frontend expects (Requirement 5):
/// <list type="bullet">
/// <item>camelCase property names</item>
/// <item><see cref="DateOnly"/> as <c>YYYY-MM-DD</c> (5.2); <c>DateTimeOffset</c>/<c>DateTime</c> as ISO-8601 (5.3)</item>
/// <item>enum-like values as their exact (uppercase) string tokens (5.4)</item>
/// <item>resource bodies returned without a wrapper envelope by default (5.6)</item>
/// </list>
/// </summary>
public static class FinoxJsonOptions
{
    /// <summary>Applies the Finox JSON conventions to the supplied options instance.</summary>
    public static JsonSerializerOptions Apply(JsonSerializerOptions options)
    {
        options.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
        options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;

        // Prevent circular reference errors from EF Core navigation properties.
        options.ReferenceHandler = ReferenceHandler.IgnoreCycles;

        // Enum values serialize as their declared string tokens (e.g. "INCOME", "SAVINGS").
        // String-backed enums in the domain keep their exact casing; this converter is the
        // fallback for any C# enum and does not force-change casing.
        options.Converters.Add(new JsonStringEnumConverter());
        options.Converters.Add(new DateOnlyJsonConverter());
        options.Converters.Add(new NullableDateOnlyJsonConverter());

        return options;
    }

    /// <summary>A standalone options instance carrying the Finox conventions (for tests/manual serialization).</summary>
    public static JsonSerializerOptions Create() => Apply(new JsonSerializerOptions(JsonSerializerDefaults.Web));
}

/// <summary>
/// Serializes <see cref="DateOnly"/> as a <c>YYYY-MM-DD</c> string and parses the same
/// format back. (Requirement 5.2.)
/// </summary>
public sealed class DateOnlyJsonConverter : JsonConverter<DateOnly>
{
    private const string Format = "yyyy-MM-dd";

    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        if (string.IsNullOrEmpty(value))
        {
            throw new JsonException("Expected a non-empty date string in YYYY-MM-DD format.");
        }

        return DateOnly.ParseExact(value, Format, CultureInfo.InvariantCulture);
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString(Format, CultureInfo.InvariantCulture));
    }
}

/// <summary>Nullable companion to <see cref="DateOnlyJsonConverter"/>.</summary>
public sealed class NullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
{
    private const string Format = "yyyy-MM-dd";

    public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        var value = reader.GetString();
        return string.IsNullOrEmpty(value)
            ? null
            : DateOnly.ParseExact(value, Format, CultureInfo.InvariantCulture);
    }

    public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
        }
        else
        {
            writer.WriteStringValue(value.Value.ToString(Format, CultureInfo.InvariantCulture));
        }
    }
}
