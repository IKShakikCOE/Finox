using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MutualFunds.Domain;
using MutualFunds.Infrastructure.Persistence;

namespace MutualFunds.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/mutual-funds")]
public sealed class MutualFundsController : ControllerBase
{
    private readonly MutualFundsDbContext _db;
    public MutualFundsController(MutualFundsDbContext db) => _db = db;

    [HttpGet("amcs")]
    public async Task<ActionResult<List<AMC>>> GetAmcs(CancellationToken ct)
        => Ok(await _db.Amcs.AsNoTracking().ToListAsync(ct));

    [HttpGet]
    public async Task<ActionResult<List<MutualFund>>> GetFunds(
        [FromQuery] string? category, [FromQuery] string? risk, [FromQuery] Guid? amcId, CancellationToken ct)
    {
        IQueryable<MutualFund> q = _db.MutualFunds.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category)) q = q.Where(f => f.Category == category);
        if (!string.IsNullOrWhiteSpace(risk)) q = q.Where(f => f.RiskLevel == risk);
        if (amcId.HasValue) q = q.Where(f => f.AmcId == amcId);
        return Ok(await q.ToListAsync(ct));
    }

    [HttpGet("profiles")]
    public async Task<ActionResult<List<AMCProfile>>> GetProfiles(CancellationToken ct)
        => Ok(await _db.AmcProfiles.AsNoTracking().ToListAsync(ct));
}




