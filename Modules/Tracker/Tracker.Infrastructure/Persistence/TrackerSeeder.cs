using Finox.Shared.Domain;
using Microsoft.EntityFrameworkCore;
using Tracker.Domain;

namespace Tracker.Infrastructure.Persistence;

public static class TrackerSeeder
{
    public static async Task SeedAsync(TrackerDbContext db)
    {
        var ownerIds = new[] { "", "USR001", "admin" };

        // Seed Categories & Sub-Categories
        var parents = new[]
        {
            new Category { Id = "cat-salary", Name = "Salary & Income", Code = "salary", Type = FlowType.INCOME, Icon = "pi-money-bill", Color = "#10B981", IsSystem = true, SortOrder = 1 },
            new Category { Id = "cat-food", Name = "Food & Groceries", Code = "food", Type = FlowType.EXPENSE, Icon = "pi-shopping-cart", Color = "#F59E0B", IsSystem = true, SortOrder = 2 },
            new Category { Id = "cat-invest", Name = "Investments & SIP", Code = "investment", Type = FlowType.EXPENSE, Icon = "pi-chart-line", Color = "#3B82F6", IsSystem = true, SortOrder = 3 },
            new Category { Id = "cat-utilities", Name = "Bills & Utilities", Code = "utilities", Type = FlowType.EXPENSE, Icon = "pi-bolt", Color = "#EF4444", IsSystem = true, SortOrder = 4 },
            new Category { Id = "cat-shopping", Name = "Shopping", Code = "shopping", Type = FlowType.EXPENSE, Icon = "pi-shopping-bag", Color = "#8B5CF6", IsSystem = true, SortOrder = 5 },
            new Category { Id = "cat-transport", Name = "Transport & Travel", Code = "transport", Type = FlowType.EXPENSE, Icon = "pi-car", Color = "#06B6D4", IsSystem = true, SortOrder = 6 },
            new Category { Id = "cat-medical", Name = "Health & Medical", Code = "medical", Type = FlowType.EXPENSE, Icon = "pi-heart", Color = "#EC4899", IsSystem = true, SortOrder = 7 }
        };

        foreach (var parent in parents)
        {
            if (!await db.Categories.IgnoreQueryFilters().AnyAsync(c => c.Id == parent.Id))
            {
                await db.Categories.AddAsync(parent);
            }
        }
        await db.SaveChangesAsync();

        var subCategories = new[]
        {
            // Salary Subcategories
            new Category { Id = "cat-salary-base", ParentId = "cat-salary", Name = "Base Salary", Code = "base_salary", Type = FlowType.INCOME, Icon = "pi-dollar", Color = "#10B981", IsSystem = true, SortOrder = 1 },
            new Category { Id = "cat-salary-bonus", ParentId = "cat-salary", Name = "Bonus & Allowance", Code = "bonus", Type = FlowType.INCOME, Icon = "pi-gift", Color = "#34D399", IsSystem = true, SortOrder = 2 },
            new Category { Id = "cat-salary-freelance", ParentId = "cat-salary", Name = "Freelance & Side Income", Code = "freelance", Type = FlowType.INCOME, Icon = "pi-briefcase", Color = "#059669", IsSystem = true, SortOrder = 3 },

            // Food Subcategories
            new Category { Id = "cat-food-groceries", ParentId = "cat-food", Name = "Daily Groceries", Code = "groceries", Type = FlowType.EXPENSE, Icon = "pi-shopping-cart", Color = "#F59E0B", IsSystem = true, SortOrder = 1 },
            new Category { Id = "cat-food-dining", ParentId = "cat-food", Name = "Dining & Restaurants", Code = "dining", Type = FlowType.EXPENSE, Icon = "pi-building", Color = "#D97706", IsSystem = true, SortOrder = 2 },
            new Category { Id = "cat-food-snacks", ParentId = "cat-food", Name = "Cafe & Snacks", Code = "snacks", Type = FlowType.EXPENSE, Icon = "pi-coffee", Color = "#B45309", IsSystem = true, SortOrder = 3 },

            // Investment Subcategories
            new Category { Id = "cat-invest-mutual", ParentId = "cat-invest", Name = "Mutual Funds & SIP", Code = "mutual_funds", Type = FlowType.EXPENSE, Icon = "pi-chart-line", Color = "#3B82F6", IsSystem = true, SortOrder = 1 },
            new Category { Id = "cat-invest-stocks", ParentId = "cat-invest", Name = "Stocks & Equities", Code = "stocks", Type = FlowType.EXPENSE, Icon = "pi-chart-bar", Color = "#2563EB", IsSystem = true, SortOrder = 2 },
            new Category { Id = "cat-invest-fdr", ParentId = "cat-invest", Name = "Fixed Deposits (FDR)", Code = "fdr", Type = FlowType.EXPENSE, Icon = "pi-lock", Color = "#1D4ED8", IsSystem = true, SortOrder = 3 },

            // Utilities Subcategories
            new Category { Id = "cat-util-electricity", ParentId = "cat-utilities", Name = "Electricity Bill", Code = "electricity", Type = FlowType.EXPENSE, Icon = "pi-bolt", Color = "#EF4444", IsSystem = true, SortOrder = 1 },
            new Category { Id = "cat-util-internet", ParentId = "cat-utilities", Name = "Internet & WiFi", Code = "internet", Type = FlowType.EXPENSE, Icon = "pi-wifi", Color = "#DC2626", IsSystem = true, SortOrder = 2 },
            new Category { Id = "cat-util-water", ParentId = "cat-utilities", Name = "Water & Gas Bill", Code = "water_gas", Type = FlowType.EXPENSE, Icon = "pi-inbox", Color = "#B91C1C", IsSystem = true, SortOrder = 3 },

            // Shopping Subcategories
            new Category { Id = "cat-shopping-clothes", ParentId = "cat-shopping", Name = "Clothing & Apparel", Code = "clothing", Type = FlowType.EXPENSE, Icon = "pi-tags", Color = "#8B5CF6", IsSystem = true, SortOrder = 1 },
            new Category { Id = "cat-shopping-electronics", ParentId = "cat-shopping", Name = "Electronics & Gadgets", Code = "electronics", Type = FlowType.EXPENSE, Icon = "pi-desktop", Color = "#7C3AED", IsSystem = true, SortOrder = 2 },
            new Category { Id = "cat-shopping-home", ParentId = "cat-shopping", Name = "Home Decor & Supplies", Code = "home_decor", Type = FlowType.EXPENSE, Icon = "pi-home", Color = "#6D28D9", IsSystem = true, SortOrder = 3 },

            // Transport Subcategories
            new Category { Id = "cat-transport-fuel", ParentId = "cat-transport", Name = "Fuel & Octane", Code = "fuel", Type = FlowType.EXPENSE, Icon = "pi-car", Color = "#06B6D4", IsSystem = true, SortOrder = 1 },
            new Category { Id = "cat-transport-rides", ParentId = "cat-transport", Name = "Uber / Pathao Rides", Code = "rides", Type = FlowType.EXPENSE, Icon = "pi-send", Color = "#0891B2", IsSystem = true, SortOrder = 2 },

            // Medical Subcategories
            new Category { Id = "cat-medical-pharmacy", ParentId = "cat-medical", Name = "Pharmacy & Medicine", Code = "pharmacy", Type = FlowType.EXPENSE, Icon = "pi-heart", Color = "#EC4899", IsSystem = true, SortOrder = 1 },
            new Category { Id = "cat-medical-doctor", ParentId = "cat-medical", Name = "Doctor & Diagnostic Tests", Code = "doctor", Type = FlowType.EXPENSE, Icon = "pi-user-plus", Color = "#DB2777", IsSystem = true, SortOrder = 2 }
        };

        foreach (var sub in subCategories)
        {
            if (!await db.Categories.IgnoreQueryFilters().AnyAsync(c => c.Id == sub.Id))
            {
                await db.Categories.AddAsync(sub);
            }
        }
        await db.SaveChangesAsync();

        // Seed Accounts per ownerId if ID doesn't exist
        foreach (var ownerId in ownerIds)
        {
            var prefix = string.IsNullOrEmpty(ownerId) ? "sys" : ownerId;
            var acc1Id = $"acc-brac-{prefix}";
            var acc2Id = $"acc-dbbl-{prefix}";
            var acc3Id = $"acc-cash-{prefix}";

            if (!await db.Accounts.IgnoreQueryFilters().AnyAsync(a => a.Id == acc1Id))
            {
                await db.Accounts.AddAsync(new Account
                {
                    Id = acc1Id, OwnerId = ownerId, Name = "BRAC Bank Account", Type = AccountType.BANK,
                    Balance = 850000m, Currency = "BDT", Icon = "pi-building", Color = "#3B82F6"
                });
            }
            if (!await db.Accounts.IgnoreQueryFilters().AnyAsync(a => a.Id == acc2Id))
            {
                await db.Accounts.AddAsync(new Account
                {
                    Id = acc2Id, OwnerId = ownerId, Name = "DBBL Savings", Type = AccountType.BANK,
                    Balance = 350000m, Currency = "BDT", Icon = "pi-wallet", Color = "#10B981"
                });
            }
            if (!await db.Accounts.IgnoreQueryFilters().AnyAsync(a => a.Id == acc3Id))
            {
                await db.Accounts.AddAsync(new Account
                {
                    Id = acc3Id, OwnerId = ownerId, Name = "Cash Wallet", Type = AccountType.CASH,
                    Balance = 50000m, Currency = "BDT", Icon = "pi-money-bill", Color = "#F59E0B"
                });
            }
        }
        await db.SaveChangesAsync();

        // Seed Budgets per ownerId if ID doesn't exist
        foreach (var ownerId in ownerIds)
        {
            var prefix = string.IsNullOrEmpty(ownerId) ? "sys" : ownerId;
            var b1Id = $"bgt-food-{prefix}";
            var b2Id = $"bgt-invest-{prefix}";
            var b3Id = $"bgt-util-{prefix}";

            if (!await db.Budgets.IgnoreQueryFilters().AnyAsync(b => b.Id == b1Id))
            {
                await db.Budgets.AddAsync(new Budget
                {
                    Id = b1Id, OwnerId = ownerId, CategoryId = "cat-food", AllocatedAmount = 25000m,
                    Period = BudgetPeriod.MONTHLY, AlertThreshold = 80
                });
            }
            if (!await db.Budgets.IgnoreQueryFilters().AnyAsync(b => b.Id == b2Id))
            {
                await db.Budgets.AddAsync(new Budget
                {
                    Id = b2Id, OwnerId = ownerId, CategoryId = "cat-invest", AllocatedAmount = 40000m,
                    Period = BudgetPeriod.MONTHLY, AlertThreshold = 90
                });
            }
            if (!await db.Budgets.IgnoreQueryFilters().AnyAsync(b => b.Id == b3Id))
            {
                await db.Budgets.AddAsync(new Budget
                {
                    Id = b3Id, OwnerId = ownerId, CategoryId = "cat-utilities", AllocatedAmount = 10000m,
                    Period = BudgetPeriod.MONTHLY, AlertThreshold = 85
                });
            }
        }
        await db.SaveChangesAsync();

        // Seed Transactions per ownerId if ID doesn't exist
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var lastMonth = now.AddMonths(-1);
        var lastMonthEndDay = DateTime.DaysInMonth(lastMonth.Year, lastMonth.Month);

        foreach (var ownerId in ownerIds)
        {
            var prefix = string.IsNullOrEmpty(ownerId) ? "sys" : ownerId;
            var accId = $"acc-brac-{prefix}";

            var day1 = Math.Min(1, now.Day);
            var day2 = Math.Min(2, now.Day);
            var day5 = Math.Min(5, now.Day);
            var day8 = Math.Min(8, now.Day);
            var dayCur = now.Day;

            var txns = new List<Transaction>
            {
                new Transaction
                {
                    Id = $"txn-1-{prefix}", OwnerId = ownerId, Title = "Techspire Solutions Salary",
                    Amount = 180000m, Type = FlowType.INCOME, Date = new DateOnly(now.Year, now.Month, day1),
                    CategoryId = "cat-salary", AccountId = accId, PaymentMethod = PaymentMethod.BANK,
                    CreatedAt = DateTime.UtcNow
                },
                new Transaction
                {
                    Id = $"txn-2-{prefix}", OwnerId = ownerId, Title = "Chaldal Grocery Shopping",
                    Amount = 12500m, Type = FlowType.EXPENSE, Date = new DateOnly(now.Year, now.Month, day2),
                    CategoryId = "cat-food", AccountId = accId, PaymentMethod = PaymentMethod.CREDIT_CARD,
                    CreatedAt = DateTime.UtcNow
                },
                new Transaction
                {
                    Id = $"txn-3-{prefix}", OwnerId = ownerId, Title = "IDLC Balanced Fund SIP",
                    Amount = 20000m, Type = FlowType.EXPENSE, Date = new DateOnly(now.Year, now.Month, day5),
                    CategoryId = "cat-invest", AccountId = accId, PaymentMethod = PaymentMethod.BANK,
                    CreatedAt = DateTime.UtcNow
                },
                new Transaction
                {
                    Id = $"txn-4-{prefix}", OwnerId = ownerId, Title = "DPDC Electricity Bill",
                    Amount = 3500m, Type = FlowType.EXPENSE, Date = new DateOnly(now.Year, now.Month, day8),
                    CategoryId = "cat-utilities", AccountId = accId, PaymentMethod = PaymentMethod.MOBILE_BANKING,
                    CreatedAt = DateTime.UtcNow
                },
                new Transaction
                {
                    Id = $"txn-5-{prefix}", OwnerId = ownerId, Title = "Apex Shoe Retail Purchase",
                    Amount = 4500m, Type = FlowType.EXPENSE, Date = new DateOnly(now.Year, now.Month, dayCur),
                    CategoryId = "cat-shopping", AccountId = accId, PaymentMethod = PaymentMethod.CREDIT_CARD,
                    CreatedAt = DateTime.UtcNow
                },
                new Transaction
                {
                    Id = $"txn-lm-1-{prefix}", OwnerId = ownerId, Title = "Techspire Solutions Salary",
                    Amount = 180000m, Type = FlowType.INCOME, Date = new DateOnly(lastMonth.Year, lastMonth.Month, 1),
                    CategoryId = "cat-salary", AccountId = accId, PaymentMethod = PaymentMethod.BANK,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1)
                },
                new Transaction
                {
                    Id = $"txn-lm-2-{prefix}", OwnerId = ownerId, Title = "Monthly Grocery & Supermarket",
                    Amount = 14000m, Type = FlowType.EXPENSE, Date = new DateOnly(lastMonth.Year, lastMonth.Month, Math.Min(8, lastMonthEndDay)),
                    CategoryId = "cat-food", AccountId = accId, PaymentMethod = PaymentMethod.CREDIT_CARD,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1)
                },
                new Transaction
                {
                    Id = $"txn-lm-3-{prefix}", OwnerId = ownerId, Title = "IDLC SIP & Mutual Fund",
                    Amount = 20000m, Type = FlowType.EXPENSE, Date = new DateOnly(lastMonth.Year, lastMonth.Month, Math.Min(10, lastMonthEndDay)),
                    CategoryId = "cat-invest", AccountId = accId, PaymentMethod = PaymentMethod.BANK,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1)
                }
            };

            foreach (var txn in txns)
            {
                if (!await db.Transactions.IgnoreQueryFilters().AnyAsync(t => t.Id == txn.Id))
                {
                    await db.Transactions.AddAsync(txn);
                }
            }
        }

        await db.SaveChangesAsync();
    }
}
