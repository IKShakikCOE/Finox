using Microsoft.EntityFrameworkCore;
namespace Calendar.Infrastructure.Persistence;
public static class CalendarSeeder
{
    public static async Task SeedAsync(DbContext db) { await Task.CompletedTask; }
}
