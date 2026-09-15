using Microsoft.EntityFrameworkCore;
namespace Bank.Infrastructure.Persistence;
public static class BankSeeder
{
    public static async Task SeedAsync(DbContext db) { await Task.CompletedTask; }
}
