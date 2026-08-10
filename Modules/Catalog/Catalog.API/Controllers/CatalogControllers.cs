using Catalog.Domain;
using Catalog.Infrastructure.Persistence;
using Finox.Shared.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authorization;

namespace Catalog.API.Controllers;

/// <summary>
/// Read-only catalog endpoints for banks, bank products, and bank profiles (Requirement 14).
/// Supports <c>?category=</c> and <c>?bankId=</c> filters on products.
/// </summary>
[ApiController]
[AllowAnonymous]
[Route("api/catalog-legacy/banks")]
public sealed class BankController : ControllerBase
{
    private readonly CatalogDbContext _db;

    public BankController(CatalogDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<Bank>>> GetBanks(CancellationToken ct)
        => Ok(await _db.Set<Bank>().AsNoTracking().ToListAsync(ct));

    [HttpGet("products")]
    public async Task<ActionResult<List<BankProduct>>> GetProducts(
        [FromQuery] string? category, [FromQuery] string? bankId, CancellationToken ct)
    {
        IQueryable<BankProduct> query = _db.Set<BankProduct>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);
        if (!string.IsNullOrWhiteSpace(bankId))
            query = query.Where(p => p.BankId == bankId);

        return Ok(await query.ToListAsync(ct));
    }

    [HttpGet("profiles")]
    public async Task<ActionResult<List<BankProfile>>> GetProfiles(CancellationToken ct)
    {
        var banks = await _db.Set<BankProfile>().AsNoTracking().ToListAsync(ct);
        return Ok(banks);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BankProfile>> GetProfile(string id, CancellationToken ct)
    {
        var profile = await _db.Set<BankProfile>().AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);
        if (profile is null)
            throw new NotFoundException($"No bank profile with id '{id}' was found.");
        return Ok(profile);
    }
}

/// <summary>Read-only catalog for insurance companies, products, and profiles (Requirement 15).</summary>
[ApiController]
[AllowAnonymous]
[Route("api/catalog-legacy/insurance")]
public sealed class InsuranceController : ControllerBase
{
    private readonly CatalogDbContext _db;
    public InsuranceController(CatalogDbContext db) => _db = db;

    [HttpGet("companies")]
    public async Task<ActionResult<List<InsuranceCompany>>> GetCompanies(CancellationToken ct)
        => Ok(await _db.Set<InsuranceCompany>().AsNoTracking().ToListAsync(ct));

    [HttpGet("products")]
    public async Task<ActionResult<List<InsuranceProduct>>> GetProducts(
        [FromQuery] string? category, [FromQuery] string? companyId, CancellationToken ct)
    {
        IQueryable<InsuranceProduct> q = _db.Set<InsuranceProduct>().AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category)) q = q.Where(p => p.Category == category);
        if (!string.IsNullOrWhiteSpace(companyId)) q = q.Where(p => p.CompanyId == companyId);
        return Ok(await q.ToListAsync(ct));
    }

    [HttpGet("profiles")]
    public async Task<ActionResult<List<InsuranceProfile>>> GetProfiles(CancellationToken ct)
        => Ok(await _db.Set<InsuranceProfile>().AsNoTracking().ToListAsync(ct));
}

/// <summary>Read-only catalog for AMCs, mutual funds, and AMC profiles (Requirement 16).</summary>
[ApiController]
[AllowAnonymous]
[Route("api/catalog-legacy/mutual-funds")]
public sealed class MutualFundsController : ControllerBase
{
    private readonly CatalogDbContext _db;
    public MutualFundsController(CatalogDbContext db) => _db = db;

    [HttpGet("amcs")]
    public async Task<ActionResult<List<AMC>>> GetAmcs(CancellationToken ct)
        => Ok(await _db.Set<AMC>().AsNoTracking().ToListAsync(ct));

    [HttpGet]
    public async Task<ActionResult<List<MutualFund>>> GetFunds(
        [FromQuery] string? category, [FromQuery] string? risk, [FromQuery] string? amcId, CancellationToken ct)
    {
        IQueryable<MutualFund> q = _db.Set<MutualFund>().AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category)) q = q.Where(f => f.Category == category);
        if (!string.IsNullOrWhiteSpace(risk)) q = q.Where(f => f.RiskLevel == risk);
        if (!string.IsNullOrWhiteSpace(amcId)) q = q.Where(f => f.AmcId == amcId);
        return Ok(await q.ToListAsync(ct));
    }

    [HttpGet("profiles")]
    public async Task<ActionResult<List<AMCProfile>>> GetProfiles(CancellationToken ct)
        => Ok(await _db.Set<AMCProfile>().AsNoTracking().ToListAsync(ct));
}

/// <summary>
/// News/Learn catalog (Requirement 18). <c>GET /api/news</c> returns a <c>NewsResponse</c>
/// wrapper with categories + articles (filters: category, search). <c>GET /api/news/{id}</c>
/// returns the full article including body content.
/// </summary>
[ApiController]
[AllowAnonymous]
[Route("api/catalog-legacy/news")]
public sealed class NewsController : ControllerBase
{
    private readonly CatalogDbContext _db;
    public NewsController(CatalogDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetNews(
        [FromQuery] string? category, [FromQuery] string? search, CancellationToken ct)
    {
        IQueryable<Article> q = _db.Set<Article>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
            q = q.Where(a => a.Category == category);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(a => a.Title.Contains(search) || (a.Excerpt != null && a.Excerpt.Contains(search)));

        var articles = await q.ToListAsync(ct);
        var categories = await _db.Set<Article>().AsNoTracking()
            .Where(a => a.Category != null)
            .Select(a => a.Category!)
            .Distinct()
            .ToListAsync(ct);

        return Ok(new { categories, articles });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Article>> GetArticle(string id, CancellationToken ct)
    {
        var article = await _db.Set<Article>().AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, ct);
        if (article is null)
            throw new NotFoundException($"No article with id '{id}' was found.");
        return Ok(article);
    }
}
