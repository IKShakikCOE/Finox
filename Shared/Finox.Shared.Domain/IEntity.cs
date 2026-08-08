namespace Finox.Shared.Domain;

/// <summary>
/// Base contract for every persisted entity. All resource identifiers are strings
/// (Requirement 5.1); the server assigns them on create (Requirement 4.2).
/// </summary>
public interface IEntity
{
    string Id { get; set; }
}

/// <summary>
/// An entity owned by a single user. The owner is the Keycloak <c>sub</c> claim and is
/// always assigned from the access token, never from the client (Requirements 3.2, 3.5).
/// Per-user reads are filtered to the current owner via a global query filter.
/// </summary>
public interface IOwnedEntity : IEntity
{
    string OwnerId { get; set; }
}
