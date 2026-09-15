using Bank.Domain;
using Bank.Infrastructure.Persistence;
using Finox.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bank.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/banks")]
public sealed class BankController : ControllerBase
{
    private readonly BankDbContext _db;

    public BankController(BankDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<BankEntity>>> GetBanks(CancellationToken ct)
        => Ok(await _db.Banks.AsNoTracking().ToListAsync(ct));

    [HttpGet("products")]
    public async Task<ActionResult<List<BankProduct>>> GetProducts(
        [FromQuery] string? category, [FromQuery] Guid? bankId, CancellationToken ct)
    {
        IQueryable<BankProduct> query = _db.BankProducts.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);
        if (bankId.HasValue)
            query = query.Where(p => p.BankId == bankId);

        return Ok(await query.ToListAsync(ct));
    }

    [HttpGet("profiles")]
    public async Task<ActionResult<List<BankProfile>>> GetProfiles(CancellationToken ct)
    {
        var banks = await _db.BankProfiles.AsNoTracking().ToListAsync(ct);
        return Ok(banks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BankProfile>> GetProfile(Guid id, CancellationToken ct)
    {
        var profile = await _db.BankProfiles.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);
        if (profile is null)
            throw new NotFoundException($"No bank profile with id '{id}' was found.");
        return Ok(profile);
    }
}




