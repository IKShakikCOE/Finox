using Finox.Shared.Domain;
using Microsoft.EntityFrameworkCore;
using Tracker.Domain;

namespace Tracker.Infrastructure.Persistence;

public static class TrackerSeeder
{
    public static async Task SeedAsync(TrackerDbContext db)
    {
        var ownerIds = new[] { "", "USR001", "admin" };

        // Seed Categories if empty
        if (!await db.Categories.IgnoreQueryFilters().AnyAsync())
        {
            var salaryCat = new Category
            {
                Id = "cat-salary", Name = "Salary", Code = "salary", Type = FlowType.INCOME,
                Icon = "pi-money-bill", Color = "#10B981", IsSystem = true, SortOrder = 1
            };
            var foodCat = new Category
            {
                Id = "cat-food", Name = "Food & Groceries", Code = "food", Type = FlowType.EXPENSE,
                Icon = "pi-shopping-cart", Color = "#F59E0B", IsSystem = true, SortOrder = 2
            };
            var investCat = new Category
            {
                Id = "cat-invest", Name = "Investments & SIP", Code = "investment", Type = FlowType.EXPENSE,
                Icon = "pi-chart-line", Color = "#3B82F6", IsSystem = true, SortOrder = 3
            };
            var utilCat = new Category
            {
                Id = "cat-utilities", Name = "Bills & Utilities", Code = "utilities", Type = FlowType.EXPENSE,
                Icon = "pi-bolt", Color = "#EF4444", IsSystem = true, SortOrder = 4
            };
            var shoppingCat = new Category
            {
                Id = "cat-shopping", Name = "Shopping", Code = "shopping", Type = FlowType.EXPENSE,
                Icon = "pi-shopping-bag", Color = "#8B5CF6", IsSystem = true, SortOrder = 5
            };

            await db.Categories.AddRangeAsync(salaryCat, foodCat, investCat, utilCat, shoppingCat);
            await db.SaveChangesAsync();
        }

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
