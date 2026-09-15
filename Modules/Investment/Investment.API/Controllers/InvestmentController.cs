using Finox.Shared.Application;
using Investment.Domain;
using Investment.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Investment.API.Controllers;

/// <summary>
/// Platforms (read-only) and campaigns (owner-scoped CRUD with status/platformId filters).
/// (Requirement 17.)
/// </summary>
[ApiController]
[Route("api/investment")]
public sealed class InvestmentController : ControllerBase
{
    private readonly InvestmentDbContext _db;
    private readonly ICrudService<Campaign> _campaigns;

    public InvestmentController(InvestmentDbContext db, ICrudService<Campaign> campaigns)
    {
        _db = db;
        _campaigns = campaigns;
    }

    [HttpGet]
    public async Task<IActionResult> GetInvestmentSummary(CancellationToken ct)
    {
        var platforms = await _db.Set<Platform>().AsNoTracking().ToListAsync(ct);
        var campaigns = await _db.Set<Campaign>().AsNoTracking().IgnoreQueryFilters().ToListAsync(ct);
        return Ok(new { platforms, campaigns });
    }

    [HttpGet("platforms")]
    public async Task<ActionResult<List<Platform>>> GetPlatforms(CancellationToken ct)
        => Ok(await _db.Set<Platform>().AsNoTracking().ToListAsync(ct));

    [HttpGet("campaigns")]
    public async Task<ActionResult<List<Campaign>>> GetCampaigns(
        [FromQuery] string? status, [FromQuery] Guid? platformId, CancellationToken ct)
    {
        IQueryable<Campaign> q = _db.Set<Campaign>().AsNoTracking().IgnoreQueryFilters();
        if (!string.IsNullOrWhiteSpace(status)) q = q.Where(c => c.Status == status);
        if (platformId.HasValue) q = q.Where(c => c.PlatformId == platformId);
        return Ok(await q.ToListAsync(ct));
    }

    [HttpPost("campaigns")]
    public async Task<ActionResult<Campaign>> CreateCampaign([FromBody] Campaign input, CancellationToken ct)
        => StatusCode(StatusCodes.Status201Created, await _campaigns.CreateAsync(input, ct));

    [HttpPut("campaigns/{id}")]
    public async Task<ActionResult<Campaign>> UpdateCampaign(Guid id, [FromBody] Campaign input, CancellationToken ct)
        => Ok(await _campaigns.UpdateAsync(id, input, ct));

    [HttpDelete("campaigns/{id}")]
    public async Task<IActionResult> DeleteCampaign(Guid id, CancellationToken ct)
    {
        await _campaigns.DeleteAsync(id, ct);
        return NoContent();
    }
}




