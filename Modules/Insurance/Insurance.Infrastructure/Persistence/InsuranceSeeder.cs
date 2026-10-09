using Microsoft.EntityFrameworkCore;
namespace Insurance.Infrastructure.Persistence;
public static class InsuranceSeeder
{
    public static async Task SeedAsync(DbContext db) { await Task.CompletedTask; }
}
