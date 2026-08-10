using Insurance.Domain;
using Microsoft.EntityFrameworkCore;

namespace Insurance.Infrastructure.Persistence;

public static class InsuranceSeeder
{
    public static async Task SeedAsync(InsuranceDbContext db)
    {
        if (!await db.Companies.AnyAsync())
        {
            var comp = new List<InsuranceCompany>
            {
                new InsuranceCompany { Id = "metlife", Name = "MetLife Bangladesh" },
                new InsuranceCompany { Id = "delta-life", Name = "Delta Life Insurance" },
                new InsuranceCompany { Id = "green-delta", Name = "Green Delta Insurance" }
            };
            await db.Companies.AddRangeAsync(comp);
        }

        if (!await db.InsuranceProducts.AnyAsync())
        {
            var insProds = new List<InsuranceProduct>
            {
                new InsuranceProduct
                {
                    Id = "metlife-dps-1", CompanyId = "metlife", CompanyName = "MetLife Bangladesh",
                    Category = "LIFE", Name = "MetLife Deposit Pension Scheme (DPS)",
                    PremiumRange = "৳2,000 - ৳50,000 / month", CoverageAmount = "Up to ৳50 Lacs", Tenure = "5 - 20 Years",
                    MaturityBenefit = "Full sum assured + accumulated bonuses",
                    Features = new List<string> { "Tax rebate", "Accidental death coverage", "Critical illness rider" },
                    Eligibility = "Age 18 - 55 years"
                },
                new InsuranceProduct
                {
                    Id = "green-delta-health-1", CompanyId = "green-delta", CompanyName = "Green Delta Insurance",
                    Category = "HEALTH", Name = "Niramoy Health Insurance",
                    PremiumRange = "৳5,000 - ৳25,000 / year", CoverageAmount = "Up to ৳10 Lacs", Tenure = "1 Year (Renewable)",
                    MaturityBenefit = "Hospitalization & Surgery cashless coverage",
                    Features = new List<string> { "Cashless hospital admission", "Daycare procedures covered", "OPD discounts" },
                    Eligibility = "Age 0 - 65 years"
                }
            };
            await db.InsuranceProducts.AddRangeAsync(insProds);
        }

        if (!await db.InsuranceProfiles.AnyAsync())
        {
            var insProfiles = new List<InsuranceProfile>
            {
                new InsuranceProfile
                {
                    Id = "metlife", Name = "MetLife Bangladesh", Type = "Life Insurance", Established = 1952,
                    PaidUpCapital = "100 Crore", TotalAssets = "16,500 Crore", ClaimSettlementRatio = 98.5m,
                    Branches = 210, Employees = 3500, Agents = 15000, Chairman = "Elena Butarova", Md = "Ala Ahmad",
                    Headquarters = "Dhaka, Bangladesh", Rating = "AAA", RatingAgency = "CRAB", RiskLevel = "LOW", SolvencyRatio = 2.1m,
                    Products = new List<string> { "Life Insurance", "Health Insurance", "Education Savings", "Corporate Group Life" },
                    Website = "https://www.metlife.com.bd"
                }
            };
            await db.InsuranceProfiles.AddRangeAsync(insProfiles);
        }

        await db.SaveChangesAsync();
    }
}
