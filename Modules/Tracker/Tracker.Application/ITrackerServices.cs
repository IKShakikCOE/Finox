using Finox.Shared.Application;
using Tracker.Domain;

namespace Tracker.Application;

/// <summary>
/// Extended transaction service with filtering capabilities.
/// </summary>
public interface ITransactionService : ICrudService<Transaction>
{
    Task<IReadOnlyList<Transaction>> ListAsync(string? type, string? search, CancellationToken ct);
}

/// <summary>
/// Extended category service with hierarchical queries and system-category protection.
/// </summary>
public interface ICategoryService : ICrudService<Category>
{
    /// <summary>Returns all categories flat (parents + children) for dropdown pickers.</summary>
    Task<IReadOnlyList<Category>> ListFlatAsync(CancellationToken ct);
}
