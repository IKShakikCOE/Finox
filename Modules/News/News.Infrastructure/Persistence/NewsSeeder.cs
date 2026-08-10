using Microsoft.EntityFrameworkCore;
using News.Domain;

namespace News.Infrastructure.Persistence;

public static class NewsSeeder
{
    public static async Task SeedAsync(NewsDbContext db)
    {
        if (!await db.Articles.AnyAsync())
        {
            var articles = new List<Article>
            {
                new Article
                {
                    Id = "ART001", Category = "Tips", Title = "5 Smart Investment Strategies for Bangladesh Stock Market in 2026",
                    Excerpt = "Learn how to build a resilient investment portfolio amidst economic shifts with mutual funds and DPS.",
                    Content = "Investing in Bangladesh's financial markets requires a strategic approach. Consider diversifying across mutual funds, high-yield FDRs, and steady dividend-paying stocks...",
                    Author = "Tanvir Ahmed, CFA", Date = "2026-05-20", ReadTime = "5 min read",
                    Tags = new List<string> { "Investment", "Mutual Funds", "Bangladesh", "Stock Market" }
                },
                new Article
                {
                    Id = "ART002", Category = "Advice", Title = "How to Maximize Income Tax Rebate Through Authorized Investments",
                    Excerpt = "A complete guide on tax-saving instruments under National Board of Revenue (NBR) guidelines.",
                    Content = "Under NBR guidelines, investments in Mutual Funds, DPS, Treasury Bonds, and Life Insurance premiums qualify for direct tax rebate benefits up to 15%...",
                    Author = "Farhana Rahman, FCA", Date = "2026-05-18", ReadTime = "7 min read",
                    Tags = new List<string> { "Tax Rebate", "NBR", "DPS", "Savings" }
                }
            };
            await db.Articles.AddRangeAsync(articles);
        }

        if (!await db.Platforms.AnyAsync())
        {
            var platforms = new List<Platform>
            {
                new Platform { Id = "facebook", Name = "Facebook", Icon = "pi pi-facebook", Color = "#1877F2" },
                new Platform { Id = "google", Name = "Google Ads", Icon = "pi pi-google", Color = "#EA4335" },
                new Platform { Id = "linkedin", Name = "LinkedIn", Icon = "pi pi-linkedin", Color = "#0A66C2" }
            };
            await db.Platforms.AddRangeAsync(platforms);
        }

        await db.SaveChangesAsync();
    }
}
