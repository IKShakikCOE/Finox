using Microsoft.EntityFrameworkCore;
using MutualFunds.Domain;

namespace MutualFunds.Infrastructure.Persistence;

public static class MutualFundsSeeder
{
    public static async Task SeedAsync(MutualFundsDbContext db)
    {
        if (!await db.Amcs.AnyAsync())
        {
            var amcs = new List<AMC>
            {
                new AMC { Id = "ICB", Name = "ICB Asset Management" },
                new AMC { Id = "IDLC", Name = "IDLC Asset Management" },
                new AMC { Id = "LBFL", Name = "LankaBangla Asset Management" },
                new AMC { Id = "VIPB", Name = "VIPB Asset Management" },
                new AMC { Id = "EDGE", Name = "Edge Asset Management" }
            };
            await db.Amcs.AddRangeAsync(amcs);
        }

        if (!await db.MutualFunds.AnyAsync())
        {
            var funds = new List<MutualFund>
            {
                new MutualFund
                {
                    Id = "MF001", AmcId = "ICB", AmcName = "ICB Asset Management",
                    Category = "GROWTH", Name = "ICB AMCL Unit Fund",
                    Nav = 12.45m, ReturnRate1Y = 8.5m, ReturnRate3Y = 22.0m, ReturnRate5Y = 38.0m,
                    MinInvestment = 5000m, ExpenseRatio = 2.50m, FundSize = "850 Cr", RiskLevel = "MODERATE",
                    Features = new List<string> { "Open-ended fund", "Daily NAV", "Dividend payout", "SIP available" },
                    Objective = "Long-term capital appreciation through equity investments"
                },
                new MutualFund
                {
                    Id = "MF002", AmcId = "IDLC", AmcName = "IDLC Asset Management",
                    Category = "GROWTH", Name = "IDLC Growth Fund",
                    Nav = 15.20m, ReturnRate1Y = 12.3m, ReturnRate3Y = 30.0m, ReturnRate5Y = 52.0m,
                    MinInvestment = 10000m, ExpenseRatio = 2.00m, FundSize = "620 Cr", RiskLevel = "HIGH",
                    Features = new List<string> { "Aggressive equity focus", "Top performer", "SIP from 1000/month" },
                    Objective = "Maximum capital growth through concentrated equity positions"
                },
                new MutualFund
                {
                    Id = "MF003", AmcId = "IDLC", AmcName = "IDLC Asset Management",
                    Category = "BALANCED", Name = "IDLC Balanced Fund",
                    Nav = 11.50m, ReturnRate1Y = 7.8m, ReturnRate3Y = 20.0m, ReturnRate5Y = 35.0m,
                    MinInvestment = 5000m, ExpenseRatio = 2.00m, FundSize = "380 Cr", RiskLevel = "MODERATE",
                    Features = new List<string> { "60:40 equity-debt mix", "Stable returns", "Monthly SIP" },
                    Objective = "Steady growth with controlled risk through balanced allocation"
                },
                new MutualFund
                {
                    Id = "MF004", AmcId = "LBFL", AmcName = "LankaBangla Asset Management",
                    Category = "FIXED_INCOME", Name = "LBFL Fixed Income Fund",
                    Nav = 10.20m, ReturnRate1Y = 5.5m, ReturnRate3Y = 15.0m, ReturnRate5Y = 26.0m,
                    MinInvestment = 10000m, ExpenseRatio = 1.50m, FundSize = "180 Cr", RiskLevel = "LOW",
                    Features = new List<string> { "Government bonds focus", "Stable income", "Low volatility" },
                    Objective = "Regular income with capital preservation through fixed income securities"
                }
            };
            await db.MutualFunds.AddRangeAsync(funds);
        }

        if (!await db.AmcProfiles.AnyAsync())
        {
            var amcProfiles = new List<AMCProfile>
            {
                new AMCProfile
                {
                    Id = "IDLC", Name = "IDLC Asset Management Limited", Established = 2015,
                    PaidUpCapital = "25 Crore", Aum = "1,200 Crore", TotalFunds = 5,
                    Chairman = "Aziz Al Mahmood", Md = "Rajib Kumar Dey", Headquarters = "Dhaka, Bangladesh",
                    Rating = "AAA", RatingAgency = "CRAB", RiskLevel = "LOW", ParentOrg = "IDLC Finance PLC",
                    FundTypes = new List<string> { "Growth", "Balanced", "Fixed Income", "Shariah" },
                    InvestmentPhilosophy = "Disciplined research-backed value investing focused on long-term wealth creation.",
                    Website = "https://idlc.com/asset-management"
                }
            };
            await db.AmcProfiles.AddRangeAsync(amcProfiles);
        }

        await db.SaveChangesAsync();
    }
}
