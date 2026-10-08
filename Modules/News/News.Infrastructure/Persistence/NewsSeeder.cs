using Microsoft.EntityFrameworkCore;
using News.Domain;

namespace News.Infrastructure.Persistence;

public static class NewsSeeder
{
    public static async Task SeedAsync(DbContext db)
    {
        if (db is not NewsDbContext newsDb) return;

        if (await newsDb.Articles.AnyAsync()) return;

        var articles = new List<Article>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Category = "News",
                Title = "Bangladesh Bank raises Policy Repo Rate to curb inflation and stabilize Forex",
                Excerpt = "The central bank of Bangladesh has revised the repo rate to 10.0%, signaling continued monetary tightening amid food and energy inflation pressures.",
                Content = @"## Monetary Policy Update
Bangladesh Bank has officially increased its policy repo rate to **10.0%** to curb stubborn core inflation and stabilize foreign exchange reserves. Commercial banks are adjusting their deposit and lending yield curves accordingly.

### Key Implications:
- **Deposit Rates:** Bank FDR and DPS rates have climbed to an attractive 9.0% - 9.5% range.
- **Credit Market:** Lending rates for retail and auto loans are trending higher.
- **Smart Money Move:** Retail investors are encouraged to lock in long-term fixed deposits or Islamic Sukuks.",
                Author = "Finox Market Research",
                Date = "October 2026",
                ReadTime = "3 min read",
                Tags = new() { "Bangladesh Bank", "Monetary Policy", "Inflation", "Interest Rates" },
                Image = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
                Featured = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                Category = "News",
                Title = "DSE Daily Turnover Surges Past 1,000 Crore as Blue-Chip Equities Rally",
                Excerpt = "Dhaka Stock Exchange benchmark index DSEX gained 85 points in a broad-based rally led by multinational pharmaceuticals, banking, and telecommunication sectors.",
                Content = @"## Stock Market Momentum
The Dhaka Stock Exchange (DSE) experienced its highest daily turnover in four months, surpassing the **1,000 Crore BDT** milestone. Institutional buying in fundamentally strong blue chips drove broad market optimism.

### Market Highlights:
- Foreign portfolio investors recorded net positive inflows for the third consecutive week.
- High-dividend yielding power and consumer goods stocks saw renewed investor interest.",
                Author = "Capital Markets Desk",
                Date = "October 2026",
                ReadTime = "4 min read",
                Tags = new() { "DSE", "Stocks", "Capital Market", "Dhaka" },
                Image = "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800",
                Featured = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                Category = "Tips",
                Title = "Smart Tax Saving Guide for FY 2026-27: Maximizing NBR Investment Rebate",
                Excerpt = "How individual taxpayers in Bangladesh can claim up to 15% investment tax rebate legally through DPS, Life Insurance, Mutual Funds, and Treasury Bonds.",
                Content = @"## Tax Optimization for Salary & Professionals
Under National Board of Revenue (NBR) guidelines, taxpayers can significantly lower their tax liability by utilizing allowable investment rebates.

### Eligible Investment Avenues:
1. **Deposit Pension Scheme (DPS):** Allowable up to BDT 1,20,000 annually.
2. **Approved Mutual Funds / Stocks:** Investments in listed securities and open-ended funds.
3. **Life Insurance Premium:** Up to 10% of total policy face value.
4. **Government Treasury Bonds & Sukuk:** Fully recognized for tax rebate.",
                Author = "Shakik Chowdhury, Finox Analyst",
                Date = "September 2026",
                ReadTime = "5 min read",
                Tags = new() { "Tax Saving", "NBR", "Rebate", "Personal Finance" },
                Image = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
                Featured = true
            },
            new()
            {
                Id = Guid.NewGuid(),
                Category = "Advice",
                Title = "How Islamic Sukuk Bonds Offer Safe and Halal Fixed Returns in Bangladesh",
                Excerpt = "Understanding asset-backed Sovereign Sukuk vs. Conventional Bonds: What Shariah-conscious investors must know about security and yields.",
                Content = @"## Understanding Sukuk
Sukuk certificates represent undivided shares in the ownership of tangible assets. Unlike conventional bonds that pay interest (Riba), Sukuk payouts stem from underlying asset lease contracts (Ijara) or profit-sharing partnerships (Mudaraba).

### Why Retail Investors Choose Sukuk:
- Backed by physical government infrastructure assets.
- Periodic semi-annual coupon distribution.
- Zero speculation risk compared to unregulated crowd schemes.",
                Author = "Islamic Finance Advisory",
                Date = "September 2026",
                ReadTime = "4 min read",
                Tags = new() { "Sukuk", "Shariah", "Halal Investment", "Fixed Income" },
                Image = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800",
                Featured = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                Category = "Learning",
                Title = "The Psychology of Money: Crucial Lessons for Emerging Market Retail Investors",
                Excerpt = "Why controlling emotional reactions to market dips and avoiding get-rich-quick scams is 90% of financial success.",
                Content = @"## Financial Literacy & Behavior
Doing well with money has a little to do with how smart you are and a lot to do with how you behave. In developing economies, FOMO (Fear of Missing Out) frequently drives individuals into unregulated Ponzi schemes promising 15-20% monthly returns.

### Golden Rules:
1. **Never invest in what you cannot independently audit.**
2. **Compounding requires patience, not reckless leverage.**
3. **Emergency funds must always precede high-risk speculations.**",
                Author = "Financial Literacy Cell",
                Date = "August 2026",
                ReadTime = "6 min read",
                Tags = new() { "Financial Literacy", "Behavioral Finance", "Scam Prevention" },
                Image = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
                Featured = false
            }
        };

        await newsDb.Articles.AddRangeAsync(articles);
        await newsDb.SaveChangesAsync();
    }
}
