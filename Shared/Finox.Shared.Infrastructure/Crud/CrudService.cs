using System.Reflection;
using Finox.Shared.Domain;
using Finox.Shared.Application;
using Microsoft.EntityFrameworkCore;

namespace Finox.Shared.Infrastructure.Crud;

/// <summary>
/// Generic CRUD implementation over any <see cref="DbContext"/>. Enforces per-user
/// ownership for writes and relies on the context's global query filter for reads, so a
/// row owned by another user is invisible and resolves to not-found (Requirements 3, 4).
/// </summary>
public class CrudService<TEntity, TContext> : ICrudService<TEntity>
    where TEntity : class, IOwnedEntity
    where TContext : DbContext
{
    protected readonly TContext Db;
    private readonly ICurrentUser _currentUser;
    private readonly IIdGenerator _idGenerator;

    public CrudService(TContext db, ICurrentUser currentUser, IIdGenerator idGenerator)
    {
        Db = db;
        _currentUser = currentUser;
        _idGenerator = idGenerator;
    }

    protected DbSet<TEntity> Set => Db.Set<TEntity>();

    public virtual async Task<IReadOnlyList<TEntity>> ListAsync(CancellationToken ct)
        => await Set.AsNoTracking().ToListAsync(ct);

    public virtual async Task<TEntity> CreateAsync(TEntity input, CancellationToken ct)
    {
        // Server assigns the id and owner; any client-supplied values are overwritten
        // (Requirements 3.2, 3.5, 4.2).
        input.Id = _idGenerator.NewId();
        input.OwnerId = _currentUser.Id;

        Set.Add(input);
        await Db.SaveChangesAsync(ct);
        return input;
    }

    public virtual async Task<TEntity> UpdateAsync(string id, TEntity input, CancellationToken ct)
    {
        // The global filter makes foreign-owned rows invisible, so this is null for them.
        var existing = await Set.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException($"No {typeof(TEntity).Name} with id '{id}' was found.");

        CopyMutableValues(input, existing);
        existing.Id = id;                       // id is immutable
        existing.OwnerId = _currentUser.Id;     // ownership cannot be reassigned by the client

        await Db.SaveChangesAsync(ct);
        return existing;
    }

    public virtual async Task DeleteAsync(string id, CancellationToken ct)
    {
        var existing = await Set.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException($"No {typeof(TEntity).Name} with id '{id}' was found.");

        Set.Remove(existing);
        await Db.SaveChangesAsync(ct);
    }

    public virtual async Task BulkDeleteAsync(IReadOnlyCollection<string> ids, CancellationToken ct)
    {
        if (ids.Count == 0)
        {
            return;
        }

        // Only the current user's rows are visible, so foreign/non-existent ids are skipped (4.7).
        var owned = await Set.Where(e => ids.Contains(e.Id)).ToListAsync(ct);
        if (owned.Count > 0)
        {
            Set.RemoveRange(owned);
            await Db.SaveChangesAsync(ct);
        }
    }

    /// <summary>
    /// Copies writable scalar properties from <paramref name="source"/> onto
    /// <paramref name="target"/>, excluding the identity/ownership keys which are managed
    /// by the service. Override for entities needing custom merge behavior.
    /// </summary>
    protected virtual void CopyMutableValues(TEntity source, TEntity target)
    {
        foreach (var prop in MutableProperties)
        {
            prop.SetValue(target, prop.GetValue(source));
        }
    }

    private static readonly PropertyInfo[] MutableProperties =
        typeof(TEntity).GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p is { CanRead: true, CanWrite: true })
            .Where(p => p.Name != nameof(IEntity.Id) && p.Name != nameof(IOwnedEntity.OwnerId))
            .ToArray();
}
