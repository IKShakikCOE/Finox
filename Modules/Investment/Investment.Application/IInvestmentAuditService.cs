using Investment.Domain;

namespace Investment.Application;

public record AuditOfferRequest(
    string RawText,
    string? CompanyName = null,
    string? Industry = null,
    string? SourceChannel = null,
    string? ContactInfo = null,
    string? Location = null,
    decimal? MinimumInvestment = null,
    decimal? PromisedMonthlyReturnPercent = null,
    string? FacebookAdUrl = null
);

public record InboundWebhookPayload(
    string? Sender,
    string? Channel,
    string? MessageText,
    string? Timestamp,
    Dictionary<string, string>? Metadata = null
);

public interface IInvestmentAuditService
{
    Task<InvestmentLead> AuditAndSaveOfferAsync(AuditOfferRequest request, Guid? ownerId = null, CancellationToken ct = default);
    Task<InvestmentLead?> GetLeadDetailsAsync(Guid leadId, CancellationToken ct = default);
    Task<IReadOnlyList<InvestmentLead>> GetLeadsAsync(string? riskLevel = null, string? status = null, CancellationToken ct = default);
    Task<bool> DeleteLeadAsync(Guid leadId, CancellationToken ct = default);
    Task<InvestmentLead> UpdateLeadStatusAsync(Guid leadId, string status, CancellationToken ct = default);
}
