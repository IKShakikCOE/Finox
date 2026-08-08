using Finox.Shared.Domain;

namespace Finox.Shared.Application;

/// <summary>
/// Generic owner-scoped CRUD operations shared by per-user collection resources
/// (Requirement 4). All reads are filtered to the current user by the DbContext; writes
/// assign the owner from the token and treat out-of-scope ids as not-found.
/// </summary>
public interface ICrudService<T> where T : class, IOwnedEntity
{
    Task<IReadOnlyList<T>> ListAsync(CancellationToken ct);

    Task<T> CreateAsync(T input, CancellationToken ct);

    Task<T> UpdateAsync(string id, T input, CancellationToken ct);

    Task DeleteAsync(string id, CancellationToken ct);

    Task BulkDeleteAsync(IReadOnlyCollection<string> ids, CancellationToken ct);
}
