using Insurance.Domain;
using Insurance.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Insurance.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/insurance")]
public sealed class InsuranceController : ControllerBase
{
    private readonly InsuranceDbContext _db;

    public InsuranceController(InsuranceDbContext db) => _db = db;

    [HttpGet("companies")]
    public async Task<ActionResult<List<InsuranceCompany>>> GetCompanies(CancellationToken ct)
        => Ok(await _db.Companies.AsNoTracking().ToListAsync(ct));

    [HttpGet("products")]
    public async Task<ActionResult<List<InsuranceProduct>>> GetProducts(
        [FromQuery] string? category, [FromQuery] Guid? companyId, CancellationToken ct)
    {
        IQueryable<InsuranceProduct> q = _db.InsuranceProducts.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category)) q = q.Where(p => p.Category == category);
        if (companyId.HasValue) q = q.Where(p => p.CompanyId == companyId);
        return Ok(await q.ToListAsync(ct));
    }

    [HttpGet("profiles")]
    public async Task<ActionResult<List<InsuranceProfile>>> GetProfiles(CancellationToken ct)
        => Ok(await _db.InsuranceProfiles.AsNoTracking().ToListAsync(ct));
}




