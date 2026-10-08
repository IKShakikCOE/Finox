using Microsoft.EntityFrameworkCore;
using MutualFunds.Domain;

namespace MutualFunds.Infrastructure.Persistence;

public static class MutualFundsSeeder
{
    public static async Task SeedAsync(DbContext db)
    {
        if (db is not MutualFundsDbContext mfDb) return;

        if (await mfDb.MutualFunds.AnyAsync()) return;

        var shantaId = Guid.NewGuid();
        var idlcId = Guid.NewGuid();
        var vipbId = Guid.NewGuid();

        var amcs = new List<AMC>
        {
            new() { Id = shantaId, Name = "Shanta Asset Management Ltd" },
            new() { Id = idlcId, Name = "IDLC Asset Management Ltd" },
            new() { Id = vipbId, Name = "VIPB Asset Management Company" }
        };

        await mfDb.Amcs.AddRangeAsync(amcs);

        var funds = new List<MutualFund>
        {
            new()
            {
                Id = Guid.NewGuid(),
                AmcId = shantaId,
                AmcName = "Shanta Asset Management Ltd",
                Category = "FIXED_INCOME",
                Name = "Shanta First Income Unit Fund",
                Nav = 11.24m,
                ReturnRate1Y = 10.85m,
                ReturnRate3Y = 9.80m,
                ReturnRate5Y = 9.45m,
                MinInvestment = 5000m,
                ExpenseRatio = 1.15m,
                FundSize = "150 Crore BDT",
                RiskLevel = "LOW",
                Features = new() { "Quarterly cash dividend distribution", "Backed by Government Treasury & Sukuk", "Low NAV volatility" },
                Objective = "Preserve capital while delivering predictable cash returns higher than typical bank savings accounts."
            },
            new()
            {
                Id = Guid.NewGuid(),
                AmcId = idlcId,
                AmcName = "IDLC Asset Management Ltd",
                Category = "BALANCED",
                Name = "IDLC Balanced Fund",
                Nav = 12.85m,
                ReturnRate1Y = 14.50m,
                ReturnRate3Y = 12.20m,
                ReturnRate5Y = 11.60m,
                MinInvestment = 5000m,
                ExpenseRatio = 1.50m,
                FundSize = "220 Crore BDT",
                RiskLevel = "MODERATE",
                Features = new() { "Balanced 60:40 Equity to Fixed-income ratio", "SIP enabled for monthly auto-invest", "Tax rebate eligible" },
                Objective = "Achieve medium-to-long term capital appreciation with steady dividend income through diversified asset allocation."
            },
            new()
            {
                Id = Guid.NewGuid(),
                AmcId = vipbId,
                AmcName = "VIPB Asset Management Company",
                Category = "GROWTH",
                Name = "VIPB Growth Fund",
                Nav = 14.10m,
                ReturnRate1Y = 18.20m,
                ReturnRate3Y = 15.40m,
                ReturnRate5Y = 14.10m,
                MinInvestment = 10000m,
                ExpenseRatio = 1.85m,
                FundSize = "180 Crore BDT",
                RiskLevel = "HIGH",
                Features = new() { "Deep value equity research", "Focus on high-growth market leaders", "BSEC approved open-ended scheme" },
                Objective = "Maximize alpha and long-term capital compounding by investing strictly in high-governance undervalued listed companies."
            }
        };

        await mfDb.MutualFunds.AddRangeAsync(funds);
        await mfDb.SaveChangesAsync();
    }
}
