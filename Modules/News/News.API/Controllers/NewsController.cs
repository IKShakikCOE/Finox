using Finox.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using News.Domain;
using News.Infrastructure.Persistence;

namespace News.API.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/news")]
public sealed class NewsController : ControllerBase
{
    private readonly NewsDbContext _db;
    public NewsController(NewsDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetNews(
        [FromQuery] string? category, [FromQuery] string? search, CancellationToken ct)
    {
        IQueryable<Article> q = _db.Articles.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(category))
            q = q.Where(a => a.Category == category);
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(a => a.Title.Contains(search) || (a.Excerpt != null && a.Excerpt.Contains(search)));

        var articles = await q.ToListAsync(ct);
        var categories = await _db.Articles.AsNoTracking()
            .Where(a => a.Category != null)
            .Select(a => a.Category!)
            .Distinct()
            .ToListAsync(ct);

        return Ok(new { categories, articles });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Article>> GetArticle(Guid id, CancellationToken ct)
    {
        var article = await _db.Articles.AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, ct);
        if (article is null)
            throw new NotFoundException($"No article with id '{id}' was found.");
        return Ok(article);
    }
}



