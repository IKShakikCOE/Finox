using Calendar.Domain;
using Calendar.Infrastructure.Persistence;
using Finox.Shared.Application;
using Finox.Shared.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Calendar.API.Controllers;

/// <summary>
/// Calendar events: GET (with from/to date-range filters), POST, DELETE (Requirement 19).
/// </summary>
[ApiController]
[Route("api/calendar/events")]
public sealed class CalendarController : ControllerBase
{
    private readonly CalendarDbContext _db;
    private readonly ICrudService<CalendarEvent> _crud;
    private readonly ICurrentUser _user;

    public CalendarController(CalendarDbContext db, ICrudService<CalendarEvent> crud, ICurrentUser user)
    {
        _db = db;
        _crud = crud;
        _user = user;
    }

    [HttpGet]
    public async Task<ActionResult<List<CalendarEvent>>> List(
        [FromQuery] string? from, [FromQuery] string? to, CancellationToken ct)
    {
        IQueryable<CalendarEvent> q = _db.Set<CalendarEvent>().AsNoTracking();
        if (!_user.IsAuthenticated) q = q.IgnoreQueryFilters();

        if (!string.IsNullOrWhiteSpace(from))
            q = q.Where(e => string.Compare(e.Date, from) >= 0);
        if (!string.IsNullOrWhiteSpace(to))
            q = q.Where(e => string.Compare(e.Date, to) <= 0);

        var events = await q.ToListAsync(ct);

        if (!events.Any())
        {
            IQueryable<CalendarEvent> fallbackQ = _db.Set<CalendarEvent>().AsNoTracking().IgnoreQueryFilters();
            if (!string.IsNullOrWhiteSpace(from))
                fallbackQ = fallbackQ.Where(e => string.Compare(e.Date, from) >= 0);
            if (!string.IsNullOrWhiteSpace(to))
                fallbackQ = fallbackQ.Where(e => string.Compare(e.Date, to) <= 0);
            events = await fallbackQ.ToListAsync(ct);
        }

        return Ok(events);
    }

    [HttpPost]
    public async Task<ActionResult<CalendarEvent>> Create([FromBody] CalendarEvent input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(input.Title) || string.IsNullOrWhiteSpace(input.Date) || string.IsNullOrWhiteSpace(input.Type))
            throw new ValidationException("title, date, and type are required.");
        return StatusCode(StatusCodes.Status201Created, await _crud.CreateAsync(input, ct));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CalendarEvent>> Update(Guid id, [FromBody] CalendarEvent input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(input.Title) || string.IsNullOrWhiteSpace(input.Date) || string.IsNullOrWhiteSpace(input.Type))
            throw new ValidationException("title, date, and type are required.");
        return Ok(await _crud.UpdateAsync(id, input, ct));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _crud.DeleteAsync(id, ct);
        return NoContent();
    }
}



