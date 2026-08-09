using Finox.Shared.Domain;
using Tracker.Domain;
using Tracker.Infrastructure.Persistence;
using Catalog.Infrastructure.Persistence;
using Investment.Infrastructure.Persistence;
using Investment.Domain;
using Calendar.Infrastructure.Persistence;
using Calendar.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.API.Controllers;

/// <summary>Aggregated dashboard data for the current user from database.</summary>
[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly TrackerDbContext _db;
    private readonly CatalogDbContext _catalogDb;
    private readonly InvestmentDbContext _investmentDb;
    private readonly CalendarDbContext _calendarDb;
    private readonly ICurrentUser _user;

    public DashboardController(TrackerDbContext db, CatalogDbContext catalogDb, InvestmentDbContext investmentDb, CalendarDbContext calendarDb, ICurrentUser user)
    {
        _db = db;
        _catalogDb = catalogDb;
        _investmentDb = investmentDb;
        _calendarDb = calendarDb;
        _user = user;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken ct)
    {
        var summary = await ComputeSummaryAsync(ct);
        return Ok(summary);
    }

    [HttpGet("recent-transactions")]
    public async Task<IActionResult> GetRecentTransactions(CancellationToken ct)
    {
        var transactions = await ComputeRecentTransactionsAsync(ct);
        return Ok(transactions);
    }

    [HttpGet("budget-health")]
    public async Task<IActionResult> GetBudgetHealth(CancellationToken ct)
    {
        var budgetHealth = await ComputeBudgetHealthAsync(ct);
        return Ok(budgetHealth);
    }

    [HttpGet("cashflow")]
    public async Task<IActionResult> GetCashFlow(CancellationToken ct)
    {
        var cashFlow = await ComputeCashFlowAsync(ct);
        return Ok(cashFlow);
    }

    [HttpGet("asset-allocations")]
    public async Task<IActionResult> GetAllocations(CancellationToken ct)
    {
        var allocations = await ComputeAllocationsAsync(ct);
        return Ok(allocations);
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications(CancellationToken ct)
    {
        var notifications = await ComputeNotificationsAsync(ct);
        return Ok(notifications);
    }

    [HttpGet("upcoming-events")]
    public async Task<IActionResult> GetUpcomingEvents(CancellationToken ct)
    {
        var events = await ComputeUpcomingEventsAsync(ct);
        return Ok(events);
    }

    [HttpGet("investment-performance")]
    public async Task<IActionResult> GetInvestmentSummary(CancellationToken ct)
    {
        var summary = await ComputeInvestmentSummaryAsync(ct);
        return Ok(summary);
    }

    [HttpGet("portfolio-overview")]
    public async Task<IActionResult> GetPortfolioOverview(CancellationToken ct)
    {
        var overview = await ComputePortfolioOverviewAsync(ct);
        return Ok(overview);
    }

    [HttpGet("financial-news")]
    public async Task<IActionResult> GetNews(CancellationToken ct)
    {
        var news = await ComputeNewsAsync(ct);
        return Ok(news);
    }

    // ─── Private Helper Calculations ──────────────────────────────────────────

    private async Task<object> ComputeSummaryAsync(CancellationToken ct)
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(now.Year, now.Month, 1);
        var lastMonthStart = monthStart.AddMonths(-1);
        var lastMonthEnd = monthStart.AddDays(-1);

        IQueryable<Account> accQuery = _db.Set<Account>().AsNoTracking();
        IQueryable<Transaction> txnQuery = _db.Set<Transaction>().AsNoTracking();

        if (!_user.IsAuthenticated)
        {
            accQuery = accQuery.IgnoreQueryFilters();
            txnQuery = txnQuery.IgnoreQueryFilters();
        }

        var accounts = await accQuery.ToListAsync(ct);
        var transactions = await txnQuery.ToListAsync(ct);

        if (!accounts.Any() && !transactions.Any())
        {
            accounts = await _db.Set<Account>().AsNoTracking().IgnoreQueryFilters().ToListAsync(ct);
            transactions = await _db.Set<Transaction>().AsNoTracking().IgnoreQueryFilters().ToListAsync(ct);
        }

        var totalBalance = accounts.Sum(a => a.Balance);
        if (totalBalance == 0 && transactions.Any())
        {
            totalBalance = transactions.Where(t => t.Type == FlowType.INCOME).Sum(t => t.Amount)
                         - transactions.Where(t => t.Type == FlowType.EXPENSE).Sum(t => t.Amount);
        }

        var monthlyIncome = transactions
            .Where(t => t.Type == FlowType.INCOME && t.Date >= monthStart && t.Date <= now)
            .Sum(t => t.Amount);
        var monthlyExpense = transactions
            .Where(t => t.Type == FlowType.EXPENSE && t.Date >= monthStart && t.Date <= now)
            .Sum(t => t.Amount);

        var lastMonthExpense = transactions
            .Where(t => t.Type == FlowType.EXPENSE && t.Date >= lastMonthStart && t.Date <= lastMonthEnd)
            .Sum(t => t.Amount);

        var netSavings = monthlyIncome - monthlyExpense;
        var savingsRate = monthlyIncome > 0 ? (int)(netSavings * 100 / monthlyIncome) : 0;
        var expenseChangePercent = lastMonthExpense > 0 
            ? Math.Round((double)((monthlyExpense - lastMonthExpense) / lastMonthExpense * 100), 1) 
            : 0;
        var balanceChangePercent = totalBalance != 0 
            ? Math.Round((double)(netSavings * 100 / totalBalance), 1) 
            : 0;

        return new
        {
            totalBalance,
            monthlyIncome,
            monthlyExpense,
            netSavings,
            savingsRate,
            balanceChangePercent,
            expenseChangePercent
        };
    }

    private async Task<object> ComputeAllocationsAsync(CancellationToken ct)
    {
        IQueryable<Account> accQuery = _db.Set<Account>().AsNoTracking();
        if (!_user.IsAuthenticated) accQuery = accQuery.IgnoreQueryFilters();

        var accounts = await accQuery.ToListAsync(ct);
        var totalBalance = accounts.Sum(a => a.Balance);
        var totalPositiveBalance = accounts.Where(a => a.Balance > 0).Sum(a => a.Balance);
        if (totalPositiveBalance == 0) totalPositiveBalance = totalBalance > 0 ? totalBalance : 1;

        var accountGroupInfo = new Dictionary<AccountType, (string Name, string Color, string TextColor)>
        {
            { AccountType.BANK, ("Bank Accounts", "bg-blue-500", "text-blue-500") },
            { AccountType.MOBILE_BANKING, ("Mobile Banking", "bg-emerald-500", "text-emerald-500") },
            { AccountType.CASH, ("Cash & Wallet", "bg-amber-500", "text-amber-500") },
            { AccountType.CREDIT_CARD, ("Credit Cards", "bg-purple-500", "text-purple-500") }
        };

        var allocations = accounts
            .GroupBy(a => a.Type)
            .Select(g =>
            {
                var groupBalance = g.Sum(a => a.Balance);
                var pct = (int)Math.Round((groupBalance / totalPositiveBalance) * 100);
                var info = accountGroupInfo.TryGetValue(g.Key, out var val) 
                    ? val 
                    : (Name: g.Key.ToString(), Color: "bg-indigo-500", TextColor: "text-indigo-500");

                return new
                {
                    assetClass = info.Name,
                    description = $"{g.Count()} Account(s) - ৳ {groupBalance:N0}",
                    percentage = Math.Max(0, pct),
                    colorClass = info.Color,
                    textColorClass = info.TextColor
                };
            })
            .OrderByDescending(a => a.percentage)
            .ToList();

        if (!allocations.Any())
        {
            allocations = new[]
            {
                new { assetClass = "Bank Accounts", description = "0 Accounts registered", percentage = 0, colorClass = "bg-blue-500", textColorClass = "text-blue-500" }
            }.ToList();
        }

        return allocations;
    }

    private async Task<object> ComputeRecentTransactionsAsync(CancellationToken ct)
    {
        IQueryable<Transaction> txnQuery = _db.Set<Transaction>().AsNoTracking().Include(t => t.Category);
        if (!_user.IsAuthenticated) txnQuery = txnQuery.IgnoreQueryFilters();

        var transactions = await txnQuery.ToListAsync(ct);

        return transactions
            .OrderByDescending(t => t.Date)
            .Take(10)
            .Select((t, i) => new
            {
                id = i + 1,
                title = t.Title,
                description = t.Title,
                category = t.Category != null ? new { name = t.Category.Name, icon = t.Category.Icon, color = t.Category.Color } : null,
                amount = t.Amount,
                type = t.Type.ToString().ToUpperInvariant(),
                date = t.Date.ToString("yyyy-MM-dd")
            })
            .ToList();
    }

    private async Task<object> ComputeNotificationsAsync(CancellationToken ct)
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(now.Year, now.Month, 1);
        var lastMonthStart = monthStart.AddMonths(-1);
        var lastMonthEnd = monthStart.AddDays(-1);

        IQueryable<Transaction> txnQuery = _db.Set<Transaction>().AsNoTracking();
        IQueryable<Budget> budgetQuery = _db.Set<Budget>().AsNoTracking().Include(b => b.Category);

        if (!_user.IsAuthenticated)
        {
            txnQuery = txnQuery.IgnoreQueryFilters();
            budgetQuery = budgetQuery.IgnoreQueryFilters();
        }

        var transactions = await txnQuery.ToListAsync(ct);
        var budgets = await budgetQuery.ToListAsync(ct);

        var monthlyIncome = transactions.Where(t => t.Type == FlowType.INCOME && t.Date >= monthStart && t.Date <= now).Sum(t => t.Amount);
        var monthlyExpense = transactions.Where(t => t.Type == FlowType.EXPENSE && t.Date >= monthStart && t.Date <= now).Sum(t => t.Amount);
        var lastMonthIncome = transactions.Where(t => t.Type == FlowType.INCOME && t.Date >= lastMonthStart && t.Date <= lastMonthEnd).Sum(t => t.Amount);
        var lastMonthExpense = transactions.Where(t => t.Type == FlowType.EXPENSE && t.Date >= lastMonthStart && t.Date <= lastMonthEnd).Sum(t => t.Amount);

        var netSavings = monthlyIncome - monthlyExpense;
        var lastMonthNetSavings = lastMonthIncome - lastMonthExpense;
        var savingsRate = monthlyIncome > 0 ? (int)(netSavings * 100 / monthlyIncome) : 0;
        var lastMonthSavingsRate = lastMonthIncome > 0 ? (int)(lastMonthNetSavings * 100 / lastMonthIncome) : 0;

        var notificationsList = new List<object>();
        int notifId = 1;

        foreach (var b in budgets.Where(b => b.IsActive && b.AllocatedAmount > 0))
        {
            var spent = transactions
                .Where(t => t.CategoryId == b.CategoryId && t.Type == FlowType.EXPENSE && t.Date >= monthStart && t.Date <= now)
                .Sum(t => t.Amount);

            var pct = (int)(spent / b.AllocatedAmount * 100);
            var categoryName = b.Category?.Name ?? "Category";

            if (spent > b.AllocatedAmount)
            {
                notificationsList.Add(new
                {
                    id = notifId++,
                    type = "budget",
                    title = "Budget Exceeded",
                    message = $"You have exceeded your {categoryName} budget by ৳ {spent - b.AllocatedAmount:N0}.",
                    timeGroup = "TODAY",
                    icon = "pi pi-exclamation-triangle",
                    bgClass = "bg-red-100 dark:bg-red-400/10",
                    iconClass = "text-red-500"
                });
            }
            else if (pct >= (b.AlertThreshold ?? 80))
            {
                notificationsList.Add(new
                {
                    id = notifId++,
                    type = "budget",
                    title = "Near Budget Limit",
                    message = $"{categoryName} budget is at {pct}% capacity.",
                    timeGroup = "TODAY",
                    icon = "pi pi-info-circle",
                    bgClass = "bg-yellow-100 dark:bg-yellow-400/10",
                    iconClass = "text-yellow-500"
                });
            }
        }

        if (savingsRate > lastMonthSavingsRate && monthlyIncome > 0)
        {
            notificationsList.Add(new
            {
                id = notifId++,
                type = "analytics",
                title = "Savings Insight",
                message = $"Your net savings rate ({savingsRate}%) increased compared to last month ({lastMonthSavingsRate}%).",
                timeGroup = "LAST WEEK",
                icon = "pi pi-arrow-up",
                bgClass = "bg-green-100 dark:bg-green-400/10",
                iconClass = "text-green-500"
            });
        }

        if (!notificationsList.Any())
        {
            notificationsList.Add(new
            {
                id = notifId++,
                type = "system",
                title = "Financial Overview",
                message = "All account balances and transactions are synchronized.",
                timeGroup = "TODAY",
                icon = "pi pi-check-circle",
                bgClass = "bg-blue-100 dark:bg-blue-400/10",
                iconClass = "text-blue-500"
            });
        }

        return notificationsList;
    }

    private async Task<object> ComputeCashFlowAsync(CancellationToken ct)
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        IQueryable<Transaction> txnQuery = _db.Set<Transaction>().AsNoTracking();
        if (!_user.IsAuthenticated) txnQuery = txnQuery.IgnoreQueryFilters();

        var transactions = await txnQuery.ToListAsync(ct);

        return Enumerable.Range(1, 4).Select(q =>
        {
            var startMonth = (q - 1) * 3 + 1;
            var endMonth = q * 3;
            var qStart = new DateOnly(now.Year, startMonth, 1);
            var qEnd = new DateOnly(now.Year, endMonth, DateTime.DaysInMonth(now.Year, endMonth));

            var qIncome = transactions
                .Where(t => t.Type == FlowType.INCOME && t.Date >= qStart && t.Date <= qEnd)
                .Sum(t => t.Amount);

            var qExpense = transactions
                .Where(t => t.Type == FlowType.EXPENSE && t.Date >= qStart && t.Date <= qEnd)
                .Sum(t => t.Amount);

            return new
            {
                quarter = $"Q{q}",
                income = qIncome,
                expense = qExpense,
                savings = qIncome - qExpense
            };
        }).ToList();
    }

    private async Task<object> ComputeBudgetHealthAsync(CancellationToken ct)
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(now.Year, now.Month, 1);

        IQueryable<Budget> budgetQuery = _db.Set<Budget>().AsNoTracking().Include(b => b.Category);
        IQueryable<Category> catQuery = _db.Set<Category>().AsNoTracking();
        IQueryable<Transaction> txnQuery = _db.Set<Transaction>().AsNoTracking();

        if (!_user.IsAuthenticated)
        {
            budgetQuery = budgetQuery.IgnoreQueryFilters();
            catQuery = catQuery.IgnoreQueryFilters();
            txnQuery = txnQuery.IgnoreQueryFilters();
        }

        var budgets = await budgetQuery.ToListAsync(ct);
        var categories = await catQuery.ToListAsync(ct);
        var transactions = await txnQuery
            .Where(t => t.Type == FlowType.EXPENSE && t.Date >= monthStart && t.Date <= now)
            .ToListAsync(ct);

        var budgetVsActual = budgets.Select(budget =>
        {
            var category = budget.Category ?? categories.FirstOrDefault(c => c.Id == budget.CategoryId);
            var categoryIds = new List<string> { budget.CategoryId };
            var children = categories.Where(c => c.ParentId == budget.CategoryId).Select(c => c.Id);
            categoryIds.AddRange(children);

            var spent = transactions
                .Where(t => t.CategoryId != null && categoryIds.Contains(t.CategoryId))
                .Sum(t => t.Amount);

            var percentage = budget.AllocatedAmount > 0 ? (int)Math.Round((double)(spent / budget.AllocatedAmount * 100)) : 0;
            var remaining = budget.AllocatedAmount - spent;
            var isOverBudget = spent > budget.AllocatedAmount;
            var isNearLimit = !isOverBudget && (budget.AlertThreshold.HasValue ? percentage >= budget.AlertThreshold.Value : percentage >= 80);

            return new
            {
                id = budget.Id,
                categoryId = budget.CategoryId,
                category = category != null ? new { id = category.Id, name = category.Name, icon = category.Icon, color = category.Color, parentId = category.ParentId } : null,
                allocatedAmount = budget.AllocatedAmount,
                amount = budget.AllocatedAmount,
                spentAmount = spent,
                spent,
                remaining,
                percentage,
                isOverBudget,
                isNearLimit,
                period = budget.Period.ToString()
            };
        }).ToList();

        var groups = new List<object>();
        var groupedByCategory = budgetVsActual
            .Where(b => b.category != null)
            .GroupBy(b =>
            {
                var parentId = b.category!.parentId;
                var parentCat = parentId != null ? categories.FirstOrDefault(c => c.Id == parentId) : null;
                return parentCat ?? categories.FirstOrDefault(c => c.Id == b.categoryId) ?? new Category { Id = b.categoryId, Name = "Other" };
            });

        foreach (var group in groupedByCategory)
        {
            var parentCat = group.Key;
            var subBudgets = group.ToList();
            var totalAllocated = subBudgets.Sum(b => b.allocatedAmount);
            var totalSpent = subBudgets.Sum(b => b.spent);
            var pct = totalAllocated > 0 ? (int)Math.Round((double)(totalSpent / totalAllocated * 100)) : 0;
            var isOver = totalSpent > totalAllocated;
            var isNear = !isOver && pct >= 80;

            groups.Add(new
            {
                parentCategory = new { id = parentCat.Id, name = parentCat.Name, icon = parentCat.Icon },
                subBudgets,
                totalAllocated,
                totalSpent,
                percentage = pct,
                remaining = totalAllocated - totalSpent,
                isOverBudget = isOver,
                isNearLimit = isNear
            });
        }

        return groups;
    }

    private async Task<object> ComputeNewsAsync(CancellationToken ct)
    {
        var articles = await _catalogDb.Articles.AsNoTracking().ToListAsync(ct);
        return articles
            .OrderByDescending(a => a.Date)
            .Take(4)
            .Select(a => new
            {
                id = a.Id,
                title = a.Title,
                category = a.Category ?? "Market News",
                publishedAt = a.Date,
                date = a.Date,
                excerpt = a.Excerpt,
                summary = a.Excerpt,
                readTimeMinutes = a.ReadTime != null ? (int.TryParse(a.ReadTime.Replace("min", "").Trim(), out var m) ? m : 3) : 3
            })
            .ToList();
    }

    private async Task<object> ComputeInvestmentSummaryAsync(CancellationToken ct)
    {
        IQueryable<Campaign> campaignQuery = _investmentDb.Campaigns.AsNoTracking();
        if (!_user.IsAuthenticated) campaignQuery = campaignQuery.IgnoreQueryFilters();

        var campaigns = await campaignQuery.ToListAsync(ct);

        var totalSpent = campaigns.Sum(c => c.Spent ?? 0);
        var totalRevenue = campaigns.Sum(c => c.Revenue ?? 0);
        var overallROAS = totalSpent > 0 ? Math.Round((double)(totalRevenue / totalSpent), 2) : 0;

        var topCampaigns = campaigns
            .OrderByDescending(c => c.Roas ?? 0)
            .Take(3)
            .Select(c => new
            {
                id = c.Id,
                name = c.Name ?? "Campaign",
                platformName = c.PlatformName ?? "Platform",
                roas = c.Roas ?? 0,
                status = c.Status ?? "ACTIVE"
            })
            .ToList();

        return new
        {
            totalSpent,
            totalRevenue,
            overallROAS,
            topCampaigns
        };
    }

    private async Task<object> ComputePortfolioOverviewAsync(CancellationToken ct)
    {
        var funds = await _catalogDb.MutualFunds.AsNoTracking().ToListAsync(ct);
        var bankProducts = await _catalogDb.BankProducts.AsNoTracking().ToListAsync(ct);

        var growthCount = funds.Count(f => f.Category == "GROWTH");
        var balancedCount = funds.Count(f => f.Category == "BALANCED");
        var fixedIncomeCount = funds.Count(f => f.Category == "FIXED_INCOME");

        var topFunds = funds
            .OrderByDescending(f => f.ReturnRate1Y)
            .Take(3)
            .Select(f => new
            {
                id = f.Id,
                name = f.Name,
                amcName = f.AmcName,
                returnRate1Y = f.ReturnRate1Y,
                riskLevel = f.RiskLevel ?? "MODERATE"
            })
            .ToList();

        var fdrs = bankProducts.Where(p => p.Category == "FDR").ToList();
        var bestFDRRate = fdrs.Any() ? fdrs.Max(f => f.InterestRate) : 0;

        return new
        {
            growthCount,
            balancedCount,
            fixedIncomeCount,
            topFunds,
            bestFDRRate,
            hasData = funds.Any() || bankProducts.Any()
        };
    }

    private async Task<object> ComputeUpcomingEventsAsync(CancellationToken ct)
    {
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
        IQueryable<CalendarEvent> eventQuery = _calendarDb.CalendarEvents.AsNoTracking();
        if (!_user.IsAuthenticated) eventQuery = eventQuery.IgnoreQueryFilters();

        var events = await eventQuery
            .Where(e => e.Date.CompareTo(today) >= 0)
            .OrderBy(e => e.Date)
            .Take(5)
            .Select(e => new
            {
                id = e.Id,
                title = e.Title,
                date = e.Date,
                time = e.Time,
                type = e.Type,
                description = e.Description,
                color = e.Color
            })
            .ToListAsync(ct);

        if (!events.Any())
        {
            events = await _calendarDb.CalendarEvents.AsNoTracking().IgnoreQueryFilters()
                .Where(e => e.Date.CompareTo(today) >= 0)
                .OrderBy(e => e.Date)
                .Take(5)
                .Select(e => new
                {
                    id = e.Id,
                    title = e.Title,
                    date = e.Date,
                    time = e.Time,
                    type = e.Type,
                    description = e.Description,
                    color = e.Color
                })
                .ToListAsync(ct);
        }

        return events;
    }
}
