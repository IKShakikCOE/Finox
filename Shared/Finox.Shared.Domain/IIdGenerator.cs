namespace Finox.Shared.Domain;

/// <summary>
/// Generates unique string identifiers for created resources. All resource ids in the
/// API are strings (Requirement 5.1); the server assigns them on create (Requirement 4.2).
/// </summary>
public interface IIdGenerator
{
    Guid NewId();
}

/// <summary>
/// Default collision-resistant implementation. Returns a 32-character lower-case hex
/// GUID ("N" format) — compact, URL-safe, and guaranteed non-empty.
/// </summary>
public sealed class GuidIdGenerator : IIdGenerator
{
    public Guid NewId() => Guid.NewGuid();
}

