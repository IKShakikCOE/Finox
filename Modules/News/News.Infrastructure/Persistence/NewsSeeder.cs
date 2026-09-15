using Microsoft.EntityFrameworkCore;
namespace News.Infrastructure.Persistence;
public static class NewsSeeder
{
    public static async Task SeedAsync(DbContext db) { await Task.CompletedTask; }
}
