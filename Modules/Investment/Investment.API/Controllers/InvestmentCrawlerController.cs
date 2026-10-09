using Investment.Application;
using Investment.Domain;
using Microsoft.AspNetCore.Mvc;

namespace Investment.API.Controllers;

/// <summary>
/// Endpoints for the automated Facebook Ad Library Crawler and Deep Forensic Investigator (/boost pipeline).
/// </summary>
[ApiController]
[Route("api/investment/crawler")]
public sealed class InvestmentCrawlerController : ControllerBase
{
    private readonly ICrawlerOrchestratorService _orchestrator;

    public InvestmentCrawlerController(ICrawlerOrchestratorService orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpGet("status")]
    public async Task<ActionResult<CrawlerStatusDto>> GetStatus(CancellationToken ct)
    {
        var status = await _orchestrator.GetStatusAsync(ct);
        return Ok(status);
    }

    [HttpPost("run-now")]
    public async Task<ActionResult<CrawlJobRecord>> TriggerCrawlNow(CancellationToken ct)
    {
        try
        {
            var job = await _orchestrator.RunCrawlAndInvestigatePipelineAsync(ct);
            return Ok(job);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("deep-investigate/{leadId:guid}")]
    public async Task<ActionResult<InvestmentLead>> DeepInvestigateLead(Guid leadId, CancellationToken ct)
    {
        try
        {
            var updated = await _orchestrator.DeepInvestigateLeadAsync(leadId, ct);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("verify-active")]
    public async Task<ActionResult<WeeklyVerificationReport>> VerifyActiveCampaigns(CancellationToken ct)
    {
        var report = await _orchestrator.VerifyActiveCampaignsWeeklyAsync(ct);
        return Ok(report);
    }
}
