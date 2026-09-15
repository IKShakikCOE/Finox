using Finox.Shared.Domain;
using Finox.Shared.Infrastructure.Crud;
using Tracker.Application;
using Tracker.Domain;
using Tracker.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Tracker.Infrastructure.Services;

/// <summary>
/// Extends the generic CRUD with transaction-specific list filters: <c>type</c>
/// (INCOME/EXPENSE) and <c>search</c> (title/remarks contains). (Requirement 10.)
/// </summary>
public sealed class TransactionService : CrudService<Transaction, TrackerDbContext>, ITransactionService
{
    public TransactionService(TrackerDbContext db, ICurrentUser currentUser, IIdGenerator idGenerator)
        : base(db, currentUser, idGenerator) { }

    public async Task<IReadOnlyList<Transaction>> ListAsync(
        string? type, string? search, CancellationToken ct)
    {
        IQueryable<Transaction> query = Set
            .AsNoTracking()
            .Include(t => t.Category)
            .Include(t => t.Account);

        if (!string.IsNullOrWhiteSpace(type) && Enum.TryParse<FlowType>(type, true, out var flowType))
        {
            query = query.Where(t => t.Type == flowType);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t =>
                t.Title.Contains(search) ||
                (t.Remarks != null && t.Remarks.Contains(search)));
        }

        return await query.OrderByDescending(t => t.Date).ToListAsync(ct);
    }

    public override async Task<IReadOnlyList<Transaction>> ListAsync(CancellationToken ct)
    {
        return await Set
            .AsNoTracking()
            .Include(t => t.Category)
            .Include(t => t.Account)
            .OrderByDescending(t => t.Date)
            .ToListAsync(ct);
    }

    public override async Task<Transaction> CreateAsync(Transaction input, CancellationToken ct)
    {
        if (input.AccountId.HasValue)
        {
            var account = await Db.Set<Account>().FirstOrDefaultAsync(a => a.Id == input.AccountId.Value, ct);
            if (account != null)
            {
                if (input.Type == FlowType.INCOME)
                    account.Balance += input.Amount;
                else if (input.Type == FlowType.EXPENSE)
                    account.Balance -= input.Amount;
            }
        }

        var created = await base.CreateAsync(input, ct);

        // Reload with navigation properties
        var entry = Db.Entry(created);
        if (created.CategoryId is not null)
            await entry.Reference(t => t.Category).LoadAsync(ct);
        if (created.AccountId is not null)
            await entry.Reference(t => t.Account).LoadAsync(ct);

        return created;
    }

    public override async Task<Transaction> UpdateAsync(Guid id, Transaction input, CancellationToken ct)
    {
        var oldTxn = await Set.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id, ct);
        if (oldTxn != null && oldTxn.AccountId.HasValue)
        {
            var oldAccount = await Db.Set<Account>().FirstOrDefaultAsync(a => a.Id == oldTxn.AccountId.Value, ct);
            if (oldAccount != null)
            {
                if (oldTxn.Type == FlowType.INCOME)
                    oldAccount.Balance -= oldTxn.Amount;
                else if (oldTxn.Type == FlowType.EXPENSE)
                    oldAccount.Balance += oldTxn.Amount;
            }
        }

        if (input.AccountId.HasValue)
        {
            var newAccount = await Db.Set<Account>().FirstOrDefaultAsync(a => a.Id == input.AccountId.Value, ct);
            if (newAccount != null)
            {
                if (input.Type == FlowType.INCOME)
                    newAccount.Balance += input.Amount;
                else if (input.Type == FlowType.EXPENSE)
                    newAccount.Balance -= input.Amount;
            }
        }

        var updated = await base.UpdateAsync(id, input, ct);

        // Reload with navigation properties
        var entry = Db.Entry(updated);
        if (updated.CategoryId is not null)
            await entry.Reference(t => t.Category).LoadAsync(ct);
        if (updated.AccountId is not null)
            await entry.Reference(t => t.Account).LoadAsync(ct);

        return updated;
    }

    public override async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var oldTxn = await Set.FirstOrDefaultAsync(t => t.Id == id, ct);
        if (oldTxn != null && oldTxn.AccountId.HasValue)
        {
            var account = await Db.Set<Account>().FirstOrDefaultAsync(a => a.Id == oldTxn.AccountId.Value, ct);
            if (account != null)
            {
                if (oldTxn.Type == FlowType.INCOME)
                    account.Balance -= oldTxn.Amount;
                else if (oldTxn.Type == FlowType.EXPENSE)
                    account.Balance += oldTxn.Amount;
            }
        }

        await base.DeleteAsync(id, ct);
    }

    public override async Task BulkDeleteAsync(IReadOnlyCollection<Guid> ids, CancellationToken ct)
    {
        var txns = await Set.Where(e => ids.Contains(e.Id)).ToListAsync(ct);
        var accountIds = txns.Where(t => t.AccountId.HasValue).Select(t => t.AccountId!.Value).Distinct().ToList();
        var accounts = await Db.Set<Account>().Where(a => accountIds.Contains(a.Id)).ToDictionaryAsync(a => a.Id, ct);

        foreach (var txn in txns)
        {
            if (txn.AccountId.HasValue && accounts.TryGetValue(txn.AccountId.Value, out var account))
            {
                if (txn.Type == FlowType.INCOME)
                    account.Balance -= txn.Amount;
                else if (txn.Type == FlowType.EXPENSE)
                    account.Balance += txn.Amount;
            }
        }

        await base.BulkDeleteAsync(ids, ct);
    }
}

/// <summary>
/// Extends generic CRUD for categories:
/// - List includes children navigation and orders by sort_order
/// - Prevents deletion/modification of system categories
/// - Sets is_system=false for user-created categories
/// </summary>
public sealed class CategoryService : CrudService<Category, TrackerDbContext>, ICategoryService
{
    public CategoryService(TrackerDbContext db, ICurrentUser currentUser, IIdGenerator idGenerator)
        : base(db, currentUser, idGenerator) { }

    public override async Task<IReadOnlyList<Category>> ListAsync(CancellationToken ct)
    {
        return await Set
            .AsNoTracking()
            .Include(c => c.Children.OrderBy(ch => ch.SortOrder))
            .Where(c => c.ParentId == null) // Only top-level; children come via Include
            .OrderBy(c => c.Type)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(ct);
    }

    /// <summary>Returns all categories flat (parents + children) for dropdown pickers.</summary>
    public async Task<IReadOnlyList<Category>> GetSubcategoriesAsync(Guid parentId, CancellationToken ct)
    {
        return await Set.Where(c => c.ParentId == parentId).ToListAsync(ct);
    }

    public async Task<IReadOnlyList<Category>> ListFlatAsync(CancellationToken ct)
    {
        return await Set
            .AsNoTracking()
            .Include(c => c.Parent)
            .OrderBy(c => c.Type)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(ct);
    }

    public override async Task<Category> CreateAsync(Category input, CancellationToken ct)
    {
        input.IsSystem = false;
        input.IsActive = true;

        // Auto-generate code from name if not provided
        if (string.IsNullOrWhiteSpace(input.Code))
        {
            input.Code = GenerateCode(input.Name);
        }

        return await base.CreateAsync(input, ct);
    }

    /// <summary>Generates a slug code from a category name (e.g., "Food & Dining" → "food_dining").</summary>
    private static string GenerateCode(string name)
    {
        return System.Text.RegularExpressions.Regex
            .Replace(name.ToLowerInvariant(), @"[^a-z0-9]+", "_")
            .Trim('_');
    }

    public override async Task<Category> UpdateAsync(Guid id, Category input, CancellationToken ct)
    {
        var existing = await Set.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException($"No Category with id '{id}' was found.");

        if (existing.IsSystem)
            throw new ValidationException("System categories cannot be modified.");

        return await base.UpdateAsync(id, input, ct);
    }

    public override async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var existing = await Set.FirstOrDefaultAsync(e => e.Id == id, ct)
            ?? throw new NotFoundException($"No Category with id '{id}' was found.");

        if (existing.IsSystem)
            throw new ValidationException("System categories cannot be deleted.");

        await base.DeleteAsync(id, ct);
    }
}

/// <summary>
/// Extends generic CRUD for accounts: defaults <c>Currency</c> to <c>BDT</c> when omitted
/// and sets <c>IsActive</c> to true on creation.
/// </summary>
public sealed class AccountService : CrudService<Account, TrackerDbContext>
{
    public AccountService(TrackerDbContext db, ICurrentUser currentUser, IIdGenerator idGenerator)
        : base(db, currentUser, idGenerator) { }

    public override Task<Account> CreateAsync(Account input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(input.Currency))
        {
            input.Currency = "BDT";
        }

        input.IsActive = true;

        return base.CreateAsync(input, ct);
    }
}




