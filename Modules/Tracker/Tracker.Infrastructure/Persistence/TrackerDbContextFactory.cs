using Finox.Shared.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Tracker.Infrastructure.Persistence;

public class TrackerDbContextFactory : IDesignTimeDbContextFactory<TrackerDbContext>
{
    public TrackerDbContext CreateDbContext(string[] args)
    {
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "../../Finox");
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json")
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var builder = new DbContextOptionsBuilder<TrackerDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Database=finox_db;Username=postgres;Password=postgres";

        builder.UseNpgsql(connectionString, b => b.MigrationsAssembly(typeof(TrackerDbContext).Assembly.FullName));

        // Use a dummy current user for design-time
        return new TrackerDbContext(builder.Options, new DummyCurrentUser());
    }

    private class DummyCurrentUser : ICurrentUser
    {
        public bool IsAuthenticated => true;
        public Guid Id => Guid.Empty;
        public string Username => "design-time";
        public string? Email => null;
        public string? FullName => null;
    }
}
