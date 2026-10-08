using Finox.Shared.Domain;
using Microsoft.EntityFrameworkCore;
using Tracker.Domain;

namespace Tracker.Infrastructure.Persistence;

public static class TrackerSeeder
{
    public static async Task SeedAsync(DbContext db)
    {
        if (db is not TrackerDbContext trackerDb) return;

        if (await trackerDb.Categories.AnyAsync(c => c.IsSystem))
        {
            return;
        }

        var now = DateTime.UtcNow;

        // --- System Income Categories ---
        var incomeCategories = new List<Category>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Salary & Employment",
                Code = "salary",
                Type = FlowType.INCOME,
                Icon = "pi pi-wallet",
                Color = "#10B981",
                SortOrder = 1,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Freelance & Consulting",
                Code = "freelance",
                Type = FlowType.INCOME,
                Icon = "pi pi-desktop",
                Color = "#3B82F6",
                SortOrder = 2,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Investments & Profit",
                Code = "investment_income",
                Type = FlowType.INCOME,
                Icon = "pi pi-chart-line",
                Color = "#8B5CF6",
                SortOrder = 3,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Business & Sales",
                Code = "business_income",
                Type = FlowType.INCOME,
                Icon = "pi pi-briefcase",
                Color = "#F59E0B",
                SortOrder = 4,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Other Income",
                Code = "other_income",
                Type = FlowType.INCOME,
                Icon = "pi pi-plus-circle",
                Color = "#64748B",
                SortOrder = 5,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            }
        };

        await trackerDb.Categories.AddRangeAsync(incomeCategories);

        // --- System Expense Categories with Subcategories ---
        var foodId = Guid.NewGuid();
        var housingId = Guid.NewGuid();
        var utilitiesId = Guid.NewGuid();
        var transportId = Guid.NewGuid();
        var healthId = Guid.NewGuid();

        var expenseCategories = new List<Category>
        {
            new()
            {
                Id = foodId,
                Name = "Food & Dining",
                Code = "food_dining",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-shopping-bag",
                Color = "#EF4444",
                SortOrder = 10,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ParentId = foodId,
                Name = "Groceries & Supermarket",
                Code = "groceries",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-cart-plus",
                Color = "#EF4444",
                SortOrder = 11,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ParentId = foodId,
                Name = "Restaurants & Cafes",
                Code = "restaurants",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-coffee",
                Color = "#F87171",
                SortOrder = 12,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = housingId,
                Name = "Housing & Rent",
                Code = "housing",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-home",
                Color = "#F97316",
                SortOrder = 20,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ParentId = housingId,
                Name = "Apartment Rent",
                Code = "apartment_rent",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-building",
                Color = "#F97316",
                SortOrder = 21,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = utilitiesId,
                Name = "Utilities & Bills",
                Code = "utilities",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-bolt",
                Color = "#EAB308",
                SortOrder = 30,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ParentId = utilitiesId,
                Name = "Electricity & Power",
                Code = "electricity",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-sun",
                Color = "#EAB308",
                SortOrder = 31,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ParentId = utilitiesId,
                Name = "Internet & Mobile",
                Code = "internet_mobile",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-wifi",
                Color = "#FDE047",
                SortOrder = 32,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = transportId,
                Name = "Transportation",
                Code = "transport",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-car",
                Color = "#06B6D4",
                SortOrder = 40,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ParentId = transportId,
                Name = "Fuel & CNG",
                Code = "fuel",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-compass",
                Color = "#06B6D4",
                SortOrder = 41,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ParentId = transportId,
                Name = "Ride Sharing (Uber/Pathao)",
                Code = "rideshare",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-ticket",
                Color = "#22D3EE",
                SortOrder = 42,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = healthId,
                Name = "Healthcare & Medical",
                Code = "healthcare",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-heart",
                Color = "#EC4899",
                SortOrder = 50,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                ParentId = healthId,
                Name = "Pharmacy & Medicines",
                Code = "medicines",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-plus",
                Color = "#EC4899",
                SortOrder = 51,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Education & Training",
                Code = "education",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-book",
                Color = "#6366F1",
                SortOrder = 60,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Shopping & Lifestyle",
                Code = "shopping",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-gift",
                Color = "#A855F7",
                SortOrder = 70,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Entertainment & Leisure",
                Code = "entertainment",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-video",
                Color = "#14B8A6",
                SortOrder = 80,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Investment (SIP / DPS)",
                Code = "savings_sip",
                Type = FlowType.EXPENSE,
                Icon = "pi pi-chart-pie",
                Color = "#10B981",
                SortOrder = 90,
                IsSystem = true,
                IsActive = true,
                CreatedAt = now
            }
        };

        await trackerDb.Categories.AddRangeAsync(expenseCategories);
        await trackerDb.SaveChangesAsync();
    }
}
