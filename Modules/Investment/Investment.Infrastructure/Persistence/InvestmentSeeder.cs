using Investment.Domain;
using Microsoft.EntityFrameworkCore;

namespace Investment.Infrastructure.Persistence;

public static class InvestmentSeeder
{
    public static async Task SeedAsync(InvestmentDbContext db)
    {
        if (!await db.Platforms.IgnoreQueryFilters().AnyAsync())
        {
            var platforms = new List<Platform>
            {
                new Platform { Id = "facebook", Name = "Facebook Ads", Icon = "pi-facebook", Color = "#1877F2" },
                new Platform { Id = "google", Name = "Google Search & Display", Icon = "pi-google", Color = "#EA4335" },
                new Platform { Id = "linkedin", Name = "LinkedIn Ads", Icon = "pi-linkedin", Color = "#0A66C2" },
                new Platform { Id = "local_media", Name = "Local Digital Portals", Icon = "pi-globe", Color = "#10B981" }
            };
            await db.Platforms.AddRangeAsync(platforms);
            await db.SaveChangesAsync();
        }

        if (!await db.Campaigns.IgnoreQueryFilters().AnyAsync())
        {
            var ownerIds = new[] { "", "USR001" };
            foreach (var ownerId in ownerIds)
            {
                var suffix = string.IsNullOrEmpty(ownerId) ? "sys" : ownerId;
                var campaigns = new List<Campaign>
                {
                    new Campaign
                    {
                        Id = $"cmp-1-{suffix}", OwnerId = ownerId, PlatformId = "facebook", PlatformName = "Facebook Ads",
                        Name = "Finox App Launch & User Acquisition", Type = "Social Media", Status = "ACTIVE",
                        StartDate = "2026-05-01", EndDate = "2026-06-30", Budget = 150000m, Spent = 95000m,
                        Impressions = 450000, Clicks = 28000, Conversions = 1400, Revenue = 380000m,
                        Cpc = 3.39m, Ctr = 6.22m, Roas = 4.0m
                    },
                    new Campaign
                    {
                        Id = $"cmp-2-{suffix}", OwnerId = ownerId, PlatformId = "google", PlatformName = "Google Search & Display",
                        Name = "Mutual Fund & Financial Advisor Search", Type = "Search Marketing", Status = "ACTIVE",
                        StartDate = "2026-05-10", EndDate = "2026-06-15", Budget = 100000m, Spent = 62000m,
                        Impressions = 220000, Clicks = 19500, Conversions = 920, Revenue = 248000m,
                        Cpc = 3.18m, Ctr = 8.86m, Roas = 4.0m
                    },
                    new Campaign
                    {
                        Id = $"cmp-3-{suffix}", OwnerId = ownerId, PlatformId = "linkedin", PlatformName = "LinkedIn Ads",
                        Name = "Corporate Banking & B2B Lead Gen", Type = "B2B Outreach", Status = "PAUSED",
                        StartDate = "2026-04-01", EndDate = "2026-04-30", Budget = 80000m, Spent = 78000m,
                        Impressions = 95000, Clicks = 4200, Conversions = 180, Revenue = 156000m,
                        Cpc = 18.57m, Ctr = 4.42m, Roas = 2.0m
                    }
                };
                await db.Campaigns.AddRangeAsync(campaigns);
            }
            await db.SaveChangesAsync();
        }
    }
}
