using Finox.Shared.Domain;
using Tracker.Domain;
using Tracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dashboard.API.Controllers;

/// <summary>Aggregated dashboard data for the current user (Requirement 23).</summary>
[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController : ControllerBase
{
    private readonly TrackerDbContext _db;
    private readonly ICurrentUser _user;

    public DashboardController(TrackerDbContext db, ICurrentUser user)
    {
        _db = db;
        _user = user;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(now.Year, now.Month, 1);

        var accounts = await _db.Set<Account>().AsNoTracking().ToListAsync(ct);
        var transactions = await _db.Set<Transaction>()
            .AsNoTracking()
            .Include(t => t.Category)
            .ToListAsync(ct);

        var totalBalance = accounts.Sum(a => a.Balance);
        var monthlyIncome = transactions
            .Where(t => t.Type == FlowType.INCOME && t.Date >= monthStart && t.Date <= now)
            .Sum(t => t.Amount);
        var monthlyExpense = transactions
            .Where(t => t.Type == FlowType.EXPENSE && t.Date >= monthStart && t.Date <= now)
            .Sum(t => t.Amount);
        var savingsRate = monthlyIncome > 0 ? (int)((monthlyIncome - monthlyExpense) * 100 / monthlyIncome) : 0;

        var summary = new
        {
            totalBalance,
            monthlyIncome,
            monthlyExpense,
            savingsRate,
            balanceChangePercent = 0m,
            expenseChangePercent = 0m
        };

        var recentTransactions = transactions
            .OrderByDescending(t => t.Date)
            .Take(5)
            .Select((t, i) => new
            {
                id = i + 1,
                description = t.Title,
                category = t.Category?.Name ?? string.Empty,
                amount = t.Amount,
                type = t.Type.ToString().ToLowerInvariant(),
                date = t.Date.ToString("yyyy-MM-dd")
            })
            .ToList();

        var dashboard = new
        {
            summary,
            allocations = Array.Empty<object>(),
            recentTransactions,
            notifications = Array.Empty<object>(),
            cashFlow = Array.Empty<object>()
        };

        return Ok(dashboard);
    }
}
