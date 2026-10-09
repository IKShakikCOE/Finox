using Finox.Shared.Domain;
using Investment.Application;
using Investment.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Investment.API.Controllers;

public sealed class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Investment Deal Screener & Due Diligence Hub ("Scam Shield").
/// Evaluates business offers, calculates Finox Trust Score (0-100),
/// performs 4-pillar forensic audits, and listens to inbound WhatsApp/Messenger webhooks.
/// </summary>
[ApiController]
[Route("api/investment/leads")]
public sealed class InvestmentLeadsController : ControllerBase
{
    private readonly IInvestmentAuditService _auditService;
    private readonly ICurrentUser _currentUser;

    public InvestmentLeadsController(
        IInvestmentAuditService auditService,
        ICurrentUser currentUser)
    {
        _auditService = auditService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InvestmentLead>>> GetLeads(
        [FromQuery] string? riskLevel,
        [FromQuery] string? status,
        CancellationToken ct)
    {
        var leads = await _auditService.GetLeadsAsync(riskLevel, status, ct);
        return Ok(leads);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InvestmentLead>> GetLead(Guid id, CancellationToken ct)
    {
        var lead = await _auditService.GetLeadDetailsAsync(id, ct);
        if (lead == null)
            return NotFound(new { message = $"Investment lead with ID '{id}' was not found." });

        return Ok(lead);
    }

    [HttpPost("audit")]
    public async Task<ActionResult<InvestmentLead>> AuditOffer(
        [FromBody] AuditOfferRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.RawText))
            return BadRequest(new { message = "Investment offer text ('rawText') is required for forensic analysis." });

        var ownerId = _currentUser.IsAuthenticated ? (Guid?)_currentUser.Id : null;
        var result = await _auditService.AuditAndSaveOfferAsync(request, ownerId, ct);

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> InboundWebhook(
        [FromBody] InboundWebhookPayload payload,
        CancellationToken ct)
    {
        var text = payload.MessageText;
        if (string.IsNullOrWhiteSpace(text))
            return BadRequest(new { status = "error", message = "No messageText found in webhook payload." });

        var request = new AuditOfferRequest(
            RawText: text,
            CompanyName: payload.Metadata != null && payload.Metadata.TryGetValue("company", out var c) ? c : null,
            SourceChannel: payload.Channel ?? "WhatsApp",
            ContactInfo: payload.Sender
        );

        var lead = await _auditService.AuditAndSaveOfferAsync(request, null, ct);

        return Ok(new
        {
            status = "success",
            leadId = lead.Id,
            companyName = lead.CompanyName,
            trustScore = lead.TrustScore,
            riskLevel = lead.RiskLevel,
            shariahStatus = lead.ShariahStatus,
            verdict = lead.AuditReport?.RecommendationSummary
        });
    }

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<InvestmentLead>> UpdateStatus(
        Guid id,
        [FromBody] UpdateStatusRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Status))
            return BadRequest(new { message = "Status cannot be empty." });

        var updated = await _auditService.UpdateLeadStatusAsync(id, request.Status, ct);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteLead(Guid id, CancellationToken ct)
    {
        var deleted = await _auditService.DeleteLeadAsync(id, ct);
        if (!deleted)
            return NotFound(new { message = $"Investment lead with ID '{id}' was not found." });

        return NoContent();
    }
}
