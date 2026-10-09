using System.Linq.Expressions;
using Advisor.Domain;
using Finox.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace Advisor.Infrastructure.Persistence;

public class AdvisorDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public AdvisorDbContext(DbContextOptions<AdvisorDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    public DbSet<AdvisorMessage> AdvisorMessages => Set<AdvisorMessage>();

    public Guid? CurrentOwnerId => _currentUser.IsAuthenticated ? _currentUser.Id : null;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AdvisorDbContext).Assembly);

        modelBuilder.Entity<AdvisorMessage>().ToTable("advisor_messages");

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




