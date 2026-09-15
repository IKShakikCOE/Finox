using System.Linq.Expressions;
using Calendar.Domain;
using Finox.Shared.Domain;
using Microsoft.EntityFrameworkCore;

namespace Calendar.Infrastructure.Persistence;

public class CalendarDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public CalendarDbContext(DbContextOptions<CalendarDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();

    public Guid? CurrentOwnerId => _currentUser.IsAuthenticated ? _currentUser.Id : null;
    public string CurrentUsername => _currentUser.IsAuthenticated ? (_currentUser.Username ?? string.Empty) : string.Empty;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CalendarDbContext).Assembly);

        modelBuilder.Entity<CalendarEvent>().ToTable("calendar_events");

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(IOwnedEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var ownerProperty = Expression.Property(parameter, nameof(IOwnedEntity.OwnerId));
                var currentOwner = Expression.Property(Expression.Constant(this), nameof(CurrentOwnerId));
                var isNull = Expression.Equal(ownerProperty, Expression.Constant(null, typeof(Guid?)));
                
                var equalsOwner = Expression.Equal(ownerProperty, currentOwner);
                var body = Expression.OrElse(isNull, equalsOwner);
                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(Expression.Lambda(body, parameter));
            }
        }
    }
}


