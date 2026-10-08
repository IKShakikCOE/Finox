using Bank.Domain;
using Microsoft.EntityFrameworkCore;

namespace Bank.Infrastructure.Persistence;

public static class BankSeeder
{
    public static async Task SeedAsync(DbContext db)
    {
        if (db is not BankDbContext bankDb) return;

        if (await bankDb.Banks.AnyAsync()) return;

        var bracId = Guid.NewGuid();
        var cityId = Guid.NewGuid();
        var eblId = Guid.NewGuid();

        var banks = new List<BankEntity>
        {
            new() { Id = bracId, Name = "BRAC Bank PLC", Logo = "brac_bank.png" },
            new() { Id = cityId, Name = "The City Bank PLC", Logo = "city_bank.png" },
            new() { Id = eblId, Name = "Eastern Bank PLC (EBL)", Logo = "ebl.png" }
        };

        await bankDb.Banks.AddRangeAsync(banks);

        var products = new List<BankProduct>
        {
            new()
            {
                Id = Guid.NewGuid(),
                BankId = bracId,
                BankName = "BRAC Bank PLC",
                Category = "DPS",
                Name = "BRAC Bank Prothom DPS",
                InterestRate = 8.50m,
                MinDeposit = 1000m,
                Tenure = "1 - 5 Years",
                Features = new() { "Automatic monthly debit", "Life insurance coverage", "Flexible monthly installments" },
                Eligibility = "Any Bangladeshi citizen aged 18+"
            },
            new()
            {
                Id = Guid.NewGuid(),
                BankId = bracId,
                BankName = "BRAC Bank PLC",
                Category = "FDR",
                Name = "BRAC Bank Term Deposit",
                InterestRate = 9.00m,
                MinDeposit = 50000m,
                Tenure = "3 Months - 3 Years",
                Features = new() { "Up to 90% loan against deposit", "Interest payout monthly/quarterly", "Automatic renewal" },
                Eligibility = "Individuals and institutions"
            },
            new()
            {
                Id = Guid.NewGuid(),
                BankId = cityId,
                BankName = "The City Bank PLC",
                Category = "DPS",
                Name = "City Islamic Monthly Mudaraba DPS",
                InterestRate = 8.75m,
                MinDeposit = 2000m,
                Tenure = "3 - 5 Years",
                Features = new() { "100% Shariah compliant", "Quarterly profit distribution", "Free internet banking" },
                Eligibility = "Individuals seeking halal returns"
            },
            new()
            {
                Id = Guid.NewGuid(),
                BankId = cityId,
                BankName = "The City Bank PLC",
                Category = "FDR",
                Name = "City Max High-Yield Fixed Deposit",
                InterestRate = 9.25m,
                MinDeposit = 100000m,
                Tenure = "1 Year",
                Features = new() { "Highest tier market yield", "Instant digital issuance via Citytouch", "Overdraft facility" },
                Eligibility = "High net-worth & retail savers"
            },
            new()
            {
                Id = Guid.NewGuid(),
                BankId = eblId,
                BankName = "Eastern Bank PLC (EBL)",
                Category = "SAVINGS",
                Name = "EBL Classic High-Interest Savings",
                InterestRate = 4.50m,
                MinDeposit = 5000m,
                Tenure = "Ongoing",
                Features = new() { "Dual currency Visa/Mastercard debit", "Unlimited digital fund transfers (NPSB/BEFTN)", "SMS banking" },
                Eligibility = "Valid NID & source of fund documents"
            }
        };

        await bankDb.BankProducts.AddRangeAsync(products);
        await bankDb.SaveChangesAsync();
    }
}
