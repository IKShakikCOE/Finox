using System.Linq.Expressions;
using Finox.Shared.Domain;
using Tracker.Domain;
using Microsoft.EntityFrameworkCore;

namespace Tracker.Infrastructure.Persistence;

/// <summary>
/// The Tracker module's EF Core context. Applies a per-user global query filter to every
/// registered <see cref="IOwnedEntity"/> so reads return only the current user's rows.
/// Special handling for <see cref="Category"/>: shows system categories (owner_id IS NULL)
/// plus the current user's own categories.
/// </summary>
public class TrackerDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public TrackerDbContext(DbContextOptions<TrackerDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<TrackerMeta> TrackerMetas => Set<TrackerMeta>();

    /// <summary>
    /// The owner id used by the per-user query filter. Read at query-translation time so a
    /// single context instance always reflects the request's current user.
    /// </summary>
    public string CurrentOwnerId => _currentUser.IsAuthenticated ? (_currentUser.Id ?? string.Empty) : string.Empty;
    public string CurrentUsername => _currentUser.IsAuthenticated ? (_currentUser.Username ?? string.Empty) : string.Empty;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations declared in this assembly.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TrackerDbContext).Assembly);

        modelBuilder.Entity<Transaction>().ToTable("transactions");
        modelBuilder.Entity<Account>().ToTable("accounts");
        modelBuilder.Entity<Category>().ToTable("categories");
        modelBuilder.Entity<Budget>().ToTable("budgets");
        modelBuilder.Entity<TrackerMeta>().ToTable("tracker_metas");

        // Apply per-user global query filters.
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IOwnedEntity).IsAssignableFrom(entityType.ClrType))
            {
                var filter = BuildOwnerFilter(entityType.ClrType);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
            }
        }
    }

    /// <summary>Builds filter matching system rows (null/empty) or current user (Id or Username).</summary>
    private LambdaExpression BuildOwnerFilter(Type clrType)
    {
        var parameter = Expression.Parameter(clrType, "e");
        var ownerProperty = Expression.Property(parameter, nameof(IOwnedEntity.OwnerId));

        var currentOwner = Expression.Property(Expression.Constant(this), nameof(CurrentOwnerId));
        var currentUsername = Expression.Property(Expression.Constant(this), nameof(CurrentUsername));

        var isNull = Expression.Equal(ownerProperty, Expression.Constant(null, typeof(string)));
        var isEmpty = Expression.Equal(ownerProperty, Expression.Constant("", typeof(string)));
        var equalsOwner = Expression.Equal(ownerProperty, currentOwner);
        var equalsUsername = Expression.Equal(ownerProperty, currentUsername);

        var body = Expression.OrElse(isNull, Expression.OrElse(isEmpty, Expression.OrElse(equalsOwner, equalsUsername)));
        return Expression.Lambda(body, parameter);
    }
}
