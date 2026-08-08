using Finox.Shared.Domain;
using Tracker.Domain;
using Tracker.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Tracker.API.Controllers;

/// <summary>
/// Returns and manages tracker metadata (payment methods + category names) per user.
/// If the user has no metadata row yet, seeds from defaults on first access.
/// </summary>
[ApiController]
[Route("api/tracker")]
public sealed class TrackerMetaController : ControllerBase
{
    private readonly TrackerDbContext _db;
    private readonly ICurrentUser _currentUser;
    private readonly IIdGenerator _idGenerator;

    private static readonly TrackerMeta DefaultMeta = new()
    {
        PaymentMethods = new() { "CASH", "BANK", "MOBILE_BANKING" },
        IncomeCategories = new() { "Salary", "Freelance / Project", "Investments Profit", "Dividends", "Other Income" },
        ExpenseCategories = new() { "Food & Grocery", "Utilities", "Investment (SIP)", "Shopping", "Rent", "Medical", "Fuel & Transport" }
    };

    public TrackerMetaController(TrackerDbContext db, ICurrentUser currentUser, IIdGenerator idGenerator)
    {
        _db = db;
        _currentUser = currentUser;
        _idGenerator = idGenerator;
    }

    [HttpGet("meta")]
    public async Task<ActionResult<TrackerMeta>> GetMeta(CancellationToken ct)
    {
        var meta = await _db.Set<TrackerMeta>()
            .FirstOrDefaultAsync(ct);

        if (meta is null)
        {
            // Seed default metadata for this user on first access
            meta = new TrackerMeta
            {
                Id = _idGenerator.NewId(),
                OwnerId = _currentUser.Id,
                PaymentMethods = new(DefaultMeta.PaymentMethods),
                IncomeCategories = new(DefaultMeta.IncomeCategories),
                ExpenseCategories = new(DefaultMeta.ExpenseCategories),
                CreatedAt = DateTime.UtcNow
            };

            _db.Set<TrackerMeta>().Add(meta);
            await _db.SaveChangesAsync(ct);
        }

        return Ok(meta);
    }

    [HttpPut("meta")]
    public async Task<ActionResult<TrackerMeta>> UpdateMeta([FromBody] TrackerMeta input, CancellationToken ct)
    {
        var meta = await _db.Set<TrackerMeta>()
            .FirstOrDefaultAsync(ct);

        if (meta is null)
        {
            meta = new TrackerMeta
            {
                Id = _idGenerator.NewId(),
                OwnerId = _currentUser.Id,
                PaymentMethods = input.PaymentMethods,
                IncomeCategories = input.IncomeCategories,
                ExpenseCategories = input.ExpenseCategories,
                CreatedAt = DateTime.UtcNow
            };

            _db.Set<TrackerMeta>().Add(meta);
        }
        else
        {
            meta.PaymentMethods = input.PaymentMethods;
            meta.IncomeCategories = input.IncomeCategories;
            meta.ExpenseCategories = input.ExpenseCategories;
            meta.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct);
        return Ok(meta);
    }
}
