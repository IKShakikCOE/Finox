using Microsoft.EntityFrameworkCore;
namespace Tracker.Infrastructure.Persistence;
public static class TrackerSeeder
{
    public static async Task SeedAsync(DbContext db) { await Task.CompletedTask; }
}
