using System.Linq.Expressions;
using Finox.Shared.Domain;
using Identity.Domain;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Persistence;

public class IdentityDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public IdentityDbContext(DbContextOptions<IdentityDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    public string CurrentOwnerId => _currentUser.IsAuthenticated ? _currentUser.Id : string.Empty;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IOwnedEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var ownerProperty = Expression.Property(parameter, nameof(IOwnedEntity.OwnerId));
                var currentOwner = Expression.Property(Expression.Constant(this), nameof(CurrentOwnerId));
                var body = Expression.Equal(ownerProperty, currentOwner);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(Expression.Lambda(body, parameter));
            }
        }

        // Configure UserSettings JSON columns
        modelBuilder.Entity<UserSettings>(b =>
        {
            b.OwnsOne(s => s.Notifications, n => n.ToJson());
            b.OwnsOne(s => s.Privacy, p => p.ToJson());
            b.OwnsOne(s => s.Display, d => d.ToJson());
        });
    }
}
