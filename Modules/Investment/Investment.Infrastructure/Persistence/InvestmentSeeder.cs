using Microsoft.EntityFrameworkCore;
namespace Investment.Infrastructure.Persistence;
public static class InvestmentSeeder
{
    public static async Task SeedAsync(DbContext db) { await Task.CompletedTask; }
}
