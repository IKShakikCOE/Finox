using System.Linq.Expressions;
using Finox.Shared.Domain;
using Messaging.Domain;
using Microsoft.EntityFrameworkCore;

namespace Messaging.Infrastructure.Persistence;

public class MessagingDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public MessagingDbContext(DbContextOptions<MessagingDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    public DbSet<Message> Messages => Set<Message>();

    public string CurrentOwnerId => _currentUser.IsAuthenticated ? _currentUser.Id : string.Empty;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MessagingDbContext).Assembly);

        modelBuilder.Entity<Message>().ToTable("messages");

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
    }
}

