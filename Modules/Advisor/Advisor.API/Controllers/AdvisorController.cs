using Advisor.Application;
using Advisor.Domain;
using Advisor.Infrastructure.Persistence;
using Finox.Shared.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Advisor.API.Controllers;

public sealed class ChatRequest
{
    public string Message { get; set; } = string.Empty;
}

/// <summary>AI Advisor chat endpoints (Requirement 21).</summary>
[ApiController]
[Route("api/advisor")]
public sealed class AdvisorController : ControllerBase
{
    private readonly IAdvisorService _advisor;
    private readonly ICurrentUser _user;
    private readonly AdvisorDbContext _db;

    public AdvisorController(IAdvisorService advisor, ICurrentUser user, AdvisorDbContext db)
    {
        _advisor = advisor;
        _user = user;
        _db = db;
    }

    [HttpPost("chat")]
    public async Task<ActionResult<AdvisorMessage>> Chat([FromBody] ChatRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
            throw new ValidationException("The 'message' field is required.");

        var reply = await _advisor.ReplyAsync(request.Message, _user.Id, ct);
        return Ok(reply);
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<AdvisorMessage>>> History(CancellationToken ct)
    {
        var messages = await _db.Set<AdvisorMessage>().AsNoTracking()
            .OrderBy(m => m.Timestamp)
            .ToListAsync(ct);
        return Ok(messages);
    }
}




