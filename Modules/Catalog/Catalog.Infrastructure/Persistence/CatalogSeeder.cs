using Microsoft.EntityFrameworkCore;
namespace Catalog.Infrastructure.Persistence;
public static class CatalogSeeder
{
    public static async Task SeedAsync(DbContext db) { await Task.CompletedTask; }
}
