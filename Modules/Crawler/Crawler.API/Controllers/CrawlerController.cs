using Crawler.Application;
using Crawler.Domain;
using Crawler.Infrastructure.Persistence;
using Finox.Shared.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Crawler.API.Controllers;

public sealed class CreateSourceRequest
{
    public string? Url { get; set; }
    public string? Kind { get; set; }
    public string? Domain { get; set; }
    public int? TimeoutSeconds { get; set; }
}

public sealed class SetScheduleRequest
{
    public int IntervalMinutes { get; set; }
}

/// <summary>
/// Admin-only crawler management endpoints (Requirements 24–30).
/// All operations require the administrator role.
/// </summary>
[ApiController]
[Route("api/crawler")]
[Authorize(Roles = "admin")]
public sealed class CrawlerController : ControllerBase
{
    private readonly CrawlerDbContext _db;
    private readonly ICrawlScheduler _scheduler;
    private readonly IIdGenerator _idGen;

    public CrawlerController(CrawlerDbContext db, ICrawlScheduler scheduler, IIdGenerator idGen)
    {
        _db = db;
        _scheduler = scheduler;
        _idGen = idGen;
    }

    /// <summary>List all crawl sources with their last job outcome (Req 24.5).</summary>
    [HttpGet("sources")]
    public async Task<IActionResult> GetSources(CancellationToken ct)
    {
        var sources = await _db.Set<CrawlSource>().IgnoreQueryFilters().AsNoTracking().ToListAsync(ct);
        return Ok(sources);
    }

    /// <summary>Register a new crawl source (Req 24.1–24.3).</summary>
    [HttpPost("sources")]
    public async Task<IActionResult> CreateSource([FromBody] CreateSourceRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Url) || !Uri.TryCreate(request.Url, UriKind.Absolute, out var uri)
            || (uri.Scheme != "http" && uri.Scheme != "https"))
        {
            throw new ValidationException("url must be a valid absolute HTTP or HTTPS URL.");
        }

        var validKinds = new[] { "HTML", "PDF" };
        if (!validKinds.Contains(request.Kind?.ToUpperInvariant()))
            throw new ValidationException($"kind must be one of: {string.Join(", ", validKinds)}");

        var validDomains = new[] { "BANK_PRODUCT", "INSURANCE_PRODUCT", "MUTUAL_FUND" };
        if (!validDomains.Contains(request.Domain?.ToUpperInvariant()))
            throw new ValidationException($"domain must be one of: {string.Join(", ", validDomains)}");

        var source = new CrawlSource
        {
            Id = _idGen.NewId(),
            Url = request.Url,
            Kind = request.Kind!.ToUpperInvariant(),
            Domain = request.Domain!.ToUpperInvariant(),
            ApprovalStatus = "UNAPPROVED",
            RequestTimeoutSeconds = Math.Clamp(request.TimeoutSeconds ?? 30, 1, 300),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Set<CrawlSource>().Add(source);
        await _db.SaveChangesAsync(ct);
        return StatusCode(StatusCodes.Status201Created, source);
    }

    /// <summary>Approve a source for crawling (Req 24.4).</summary>
    [HttpPost("sources/{id}/approve")]
    public async Task<IActionResult> ApproveSource(string id, CancellationToken ct)
    {
        var source = await _db.Set<CrawlSource>().IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException($"Source '{id}' not found.");

        source.ApprovalStatus = "APPROVED";
        source.ModifiedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);
        return Ok(source);
    }

    /// <summary>Set a recurring schedule (Req 25.1–25.2).</summary>
    [HttpPut("sources/{id}/schedule")]
    public async Task<IActionResult> SetSchedule(string id, [FromBody] SetScheduleRequest request, CancellationToken ct)
    {
        var source = await _db.Set<CrawlSource>().IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException($"Source '{id}' not found.");

        if (request.IntervalMinutes < 60 || request.IntervalMinutes > 43200)
            throw new ValidationException("Recurrence interval must be between 60 (1 hour) and 43200 (30 days) minutes.");

        var schedule = await _db.Set<CrawlSchedule>().IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.CrawlSourceId == id, ct);

        if (schedule is null)
        {
            schedule = new CrawlSchedule { Id = _idGen.NewId(), CrawlSourceId = id };
            _db.Set<CrawlSchedule>().Add(schedule);
        }

        schedule.IntervalMinutes = request.IntervalMinutes;
        schedule.Enabled = true;
        await _db.SaveChangesAsync(ct);

        _scheduler.RegisterRecurring(id, TimeSpan.FromMinutes(request.IntervalMinutes));
        return Ok(schedule);
    }

    /// <summary>Trigger an on-demand crawl (Req 25.5–25.6).</summary>
    [HttpPost("sources/{id}/run")]
    public async Task<IActionResult> RunNow(string id, CancellationToken ct)
    {
        var source = await _db.Set<CrawlSource>().IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException($"Source '{id}' not found.");

        if (source.ApprovalStatus != "APPROVED")
            throw new ValidationException("Only approved sources can be crawled.");

        _scheduler.EnqueueOnDemand(id);
        return Accepted();
    }

    /// <summary>Crawl job history for a source (Req 30.1).</summary>
    [HttpGet("sources/{id}/jobs")]
    public async Task<IActionResult> GetJobs(string id, CancellationToken ct)
    {
        var jobs = await _db.Set<CrawlJob>().IgnoreQueryFilters().AsNoTracking()
            .Where(j => j.CrawlSourceId == id)
            .OrderByDescending(j => j.StartedAt)
            .ToListAsync(ct);
        return Ok(jobs);
    }
}
